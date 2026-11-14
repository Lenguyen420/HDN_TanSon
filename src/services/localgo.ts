import { apiRequest, type ApiData, type ApiList } from "./api";
import { loginTrade, tradeRequest } from "./trade";
import { features } from "@/datas/features";
export interface LocalGoCategory {
  code: string;
  name: string;
}
export interface LocalGoHours {
  day: number;
  open: string;
  close: string;
}
export interface LocalGoPlace {
  id: string;
  name: string;
  category: string;
  description: string;
  content?: string;
  address: string;
  location: { type: "Point"; coordinates: [number, number] };
  coverImage: string;
  images?: string[];
  phone?: string;
  website?: string;
  zalo?: string;
  openingHours?: LocalGoHours[];
  memberId: string | null;
  createdBy: string;
  status: "published";
  isVisible: boolean;
  publishedAt: string;
  deletedAt: string | null;
}
export type LocalGoDraft = Pick<
  LocalGoPlace,
  "name" | "category" | "description" | "address" | "location" | "coverImage"
> &
  Partial<
    Pick<
      LocalGoPlace,
      "content" | "images" | "phone" | "website" | "zalo" | "openingHours"
    >
  >;
export async function requireLocalGoMember() {
  if (features.tradePreview)
    throw new Error("Vui lòng mở ứng dụng chính thức để quản lý địa điểm.");
  const actor = await loginTrade();
  if (!actor.memberId || actor.status !== "ACTIVE")
    throw new Error(
      "Chức năng này dành cho hội viên đang hoạt động. Vui lòng hoàn tất đăng ký hoặc liên hệ Ban thư ký Hội.",
    );
  return actor;
}
async function memberRequest<T>(path: string, method = "GET", body?: unknown) {
  await requireLocalGoMember();
  return tradeRequest<T>(path, method, body, true);
}
export const getLocalGoCategories = async () =>
  (await apiRequest<ApiData<LocalGoCategory[]>>("localgo/categories")).data;
export async function listLocalGoPlaces(
  search: string,
  category: string,
  mine = false,
): Promise<ApiList<LocalGoPlace>> {
  const data: LocalGoPlace[] = [];
  for (let page = 1; ; page++) {
    const params = new URLSearchParams({ page: String(page), limit: "100" });
    if (search.trim()) params.set("search", search.trim());
    if (category) params.set("category", category);
    const path = `localgo/${mine ? "my-places" : "places"}?${params}`;
    const result = mine
      ? ((await memberRequest<LocalGoPlace[]>(
          path,
        )) as unknown as ApiList<LocalGoPlace>)
      : await apiRequest<ApiList<LocalGoPlace>>(path);
    if (
      !Array.isArray(result.data) ||
      !Number.isFinite(result.pagination?.total)
    )
      throw new Error("Danh sách địa điểm không hợp lệ.");
    data.push(...result.data);
    if (data.length >= result.pagination.total)
      return {
        data,
        pagination: { page: 1, limit: data.length, total: data.length },
      };
    if (!result.data.length)
      throw new Error("Chưa tải đủ địa điểm. Vui lòng làm mới.");
  }
}
export async function getLocalGoPlace(id: string, manage = false) {
  const path = `localgo/places/${encodeURIComponent(id)}${manage ? "/manage" : ""}`;
  return (
    manage
      ? await memberRequest<LocalGoPlace>(path)
      : await apiRequest<ApiData<LocalGoPlace>>(path)
  ).data;
}
export async function saveLocalGoPlace(draft: LocalGoDraft, id?: string) {
  validateLocalGoDraft(draft);
  if (JSON.stringify(draft).length > 2_800_000)
    throw new Error("Tổng dung lượng ảnh quá lớn. Vui lòng giảm số ảnh.");
  return (
    await memberRequest<LocalGoPlace>(
      `localgo/places${id ? "/" + encodeURIComponent(id) : ""}`,
      id ? "PATCH" : "POST",
      draft,
    )
  ).data;
}
export async function setLocalGoVisibility(id: string, isVisible: boolean) {
  return (
    await memberRequest<LocalGoPlace>(
      `localgo/places/${encodeURIComponent(id)}/visibility`,
      "PATCH",
      { isVisible },
    )
  ).data;
}
export const deleteLocalGoPlace = (id: string) =>
  memberRequest(`localgo/places/${encodeURIComponent(id)}`, "DELETE");
export function validCoordinates(value: number[]): value is [number, number] {
  return (
    value.length === 2 &&
    value.every(Number.isFinite) &&
    Math.abs(value[0]) <= 180 &&
    Math.abs(value[1]) <= 90
  );
}
export function validateLocalGoDraft(draft: LocalGoDraft) {
  if (
    ![
      draft.name,
      draft.category,
      draft.description,
      draft.address,
      draft.coverImage,
    ].every((value) => value.trim())
  )
    throw new Error(
      "Vui lòng nhập đủ thông tin bắt buộc và chọn ảnh đại diện.",
    );
  if (!validCoordinates(draft.location.coordinates))
    throw new Error("Vui lòng chọn vị trí hợp lệ trên bản đồ.");
  if (
    [draft.name, draft.description, draft.content || "", draft.address].some(
      (value) => /[<>]/.test(value),
    )
  )
    throw new Error("Nội dung chỉ hỗ trợ văn bản thuần, không chứa thẻ HTML.");
  for (const value of [draft.website, draft.zalo])
    if (value) {
      let url: URL;
      try {
        url = new URL(value);
      } catch {
        throw new Error("Website và Zalo cần có đường dẫn HTTP(S) hợp lệ.");
      }
      if (
        !["https:", "http:"].includes(url.protocol) ||
        url.username ||
        url.password
      )
        throw new Error("Website và Zalo cần có đường dẫn HTTP(S) hợp lệ.");
    }
}
export function localGoDirections(place: Pick<LocalGoPlace, "location">) {
  const [lng, lat] = place.location.coordinates;
  if (!validCoordinates([lng, lat]))
    throw new Error("Tọa độ địa điểm không hợp lệ.");
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
}
export async function openLocalGoLink(value: string) {
  const url = new URL(value);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Đường dẫn không hợp lệ.");
  if (
    window.location.hostname === "h5.zdn.vn" ||
    /Zalo/i.test(navigator.userAgent)
  ) {
    const { openWebview } = await import("zmp-sdk/apis");
    await openWebview({ url: url.href });
  } else window.open(url.href, "_blank", "noopener,noreferrer");
}
export async function prepareLocalGoImage(file: File): Promise<string> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Chọn ảnh JPG, PNG hoặc WebP tối đa 10 MB.");
  const src = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = src;
    await image.decode();
    let edge = 1000;
    while (edge >= 200) {
      const ratio = Math.min(1, edge / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Không thể xử lý ảnh.");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      const result = canvas.toDataURL("image/jpeg", 0.75);
      if (result.length <= 220_000) return result;
      edge = Math.floor(edge * 0.75);
    }
    throw new Error("Ảnh quá nhiều chi tiết. Vui lòng chọn ảnh khác.");
  } finally {
    URL.revokeObjectURL(src);
  }
}
