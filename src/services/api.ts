const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
export const apiBaseUrl = (configuredUrl || (import.meta.env.DEV ? "/api/v1" : "http://localhost:4000/api/v1")).replace(/\/+$/, "");
export const useMockData = import.meta.env.VITE_USE_MOCK_DATA === "true";

export class ApiError extends Error {
  constructor(message: string, public readonly status: number) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(`${apiBaseUrl}/${path.replace(/^\/+/, "")}`, {
      ...options,
      headers: { Accept: "application/json", ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers },
      signal: controller.signal,
    });
    if (response.status === 204) return undefined as T;
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const message = payload?.message;
      throw new ApiError(Array.isArray(message) ? message.join("\n") : typeof message === "string" ? message : "Không thể xử lý yêu cầu. Vui lòng thử lại.", response.status);
    }
    if (payload === null) throw new ApiError("Máy chủ trả về dữ liệu không hợp lệ.", response.status);
    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(controller.signal.aborted ? "Yêu cầu quá thời gian chờ. Vui lòng thử lại." : "Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối và thử lại.", 0);
  } finally {
    window.clearTimeout(timeout);
  }
}

// Backend lưu ảnh dưới dạng uploads/... hoặc /uploads/..., ngoài prefix /api/v1.
export function resolveApiImage(value?: string | null): string | null {
  if (!value) return null;
  const absoluteBase = new URL(apiBaseUrl, window.location?.origin).href;
  return new URL(value, `${absoluteBase.replace(/\/api\/v1$/, "")}/`).href;
}

export interface ApiData<T> { data: T; }
export interface ApiList<T> extends ApiData<T[]> {
  pagination: { page: number; limit: number; total: number };
}

export async function getAllPublicItems<T>(collection: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  while (true) {
    const result = await apiRequest<ApiList<T>>(`public/${collection}?page=${page}&limit=100`);
    if (!Array.isArray(result.data) || !result.pagination || !Number.isFinite(result.pagination.total)) {
      throw new ApiError("Máy chủ trả về danh sách không hợp lệ.", 200);
    }
    items.push(...result.data);
    if (items.length >= result.pagination.total) return items;
    if (!result.data.length) throw new ApiError("Không thể tải đầy đủ danh sách. Vui lòng thử lại.", 200);
    page += 1;
  }
}
