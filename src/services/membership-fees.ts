import { apiRequest, ApiError, type ApiData, type ApiList } from "./api";
import { registrationTokens } from "./registration-notifications";
export type FeeStatus =
  "unpaid" | "overdue" | "pending_confirmation" | "paid" | "cancelled";
export interface FeeCampaign {
  id: string;
  title: string;
  year: number;
  amount: number;
  dueDate: string;
  description: string;
  paymentInstructions: string;
  status: string;
}
export interface FeePayment {
  id: string;
  amount: number;
  method: string;
  transactionRef: string;
  proofUrl: string;
  note: string;
  status: "pending" | "confirmed" | "rejected";
  createdAt: string;
  confirmedAt?: string;
  audit: { action: string; note?: string; at: string }[];
}
export interface FeeDue {
  id: string;
  amountDue: number;
  status: FeeStatus;
  campaign: FeeCampaign;
  paidAt?: string;
  transactionRef?: string;
  payments?: FeePayment[];
}
export interface FeeProof {
  proofImage: string;
  note: string;
}
export const feeStatusLabels: Record<string, string> = {
  unpaid: "Chưa đóng",
  overdue: "Quá hạn",
  pending_confirmation: "Chờ xác nhận",
  paid: "Đã đóng",
  cancelled: "Đã hủy",
  pending: "Chờ đối soát",
  confirmed: "Đã xác nhận",
  rejected: "Đã từ chối",
};
type FeeSession = {
  accessToken: string;
  expiresIn: number;
  member: { id: string; name: string };
};
let session: { token: string; key: string; until: number } | undefined;
let pending: { key: string; promise: Promise<string> } | undefined;
async function feeToken(): Promise<string> {
  const tokens = registrationTokens();
  if (!tokens.length) {
    session = undefined;
    throw new Error(
      "Thiết bị này chưa có mã bí mật của hồ sơ đăng ký. Vui lòng mở trên thiết bị đã đăng ký hoặc liên hệ Ban thư ký.",
    );
  }
  const key = [...tokens].sort().join(":");
  if (session?.key === key && session.until > Date.now()) return session.token;
  if (pending?.key === key) return pending.promise;
  const promise = apiRequest<ApiData<FeeSession>>("membership-fees/session", {
    method: "POST",
    body: JSON.stringify({ tokens }),
  })
    .then(({ data }) => {
      if (
        !data.accessToken ||
        !Number.isFinite(data.expiresIn) ||
        !data.member?.id
      )
        throw new Error("Không xác thực được phiên hội phí.");
      if (pending?.promise === promise)
        session = {
          token: data.accessToken,
          key,
          until: Date.now() + data.expiresIn * 1000 - 30000,
        };
      return data.accessToken;
    })
    .finally(() => {
      if (pending?.promise === promise) pending = undefined;
    });
  pending = { key, promise };
  return promise;
}
async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const send = (token: string) =>
    apiRequest<T>("membership-fees/" + path, {
      method,
      headers: { Authorization: "Bearer " + token },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  const token = await feeToken();
  try {
    return await send(token);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (session?.token === token) session = undefined;
    return send(await feeToken());
  }
}

export async function getMyFees(): Promise<FeeDue[]> {
  const rows: FeeDue[] = [];
  for (let page = 1; ; page++) {
    const result = await request<ApiList<FeeDue>>(
      "my-dues?page=" + page + "&limit=100",
    );
    rows.push(...result.data);
    if (rows.length >= result.pagination.total) return rows;
    if (!result.data.length)
      throw new Error("Chưa tải đủ hội phí. Vui lòng thử lại.");
  }
}
export async function getMyFee(id: string) {
  return (await request<ApiData<FeeDue>>("my-dues/" + encodeURIComponent(id)))
    .data;
}
export async function submitFeeProof(id: string, proof: FeeProof) {
  await request(
    "my-dues/" + encodeURIComponent(id) + "/payment-proof",
    "POST",
    proof,
  );
}

export async function getFeeProofImage(id: string) {
  return (
    await request<ApiData<{ image: string }>>(
      "payments/" + encodeURIComponent(id) + "/proof?format=data",
    )
  ).data.image;
}
