import { apiRequest, type ApiData, type ApiList } from "./api";
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
  transactionRef: string;
  proofUrl: string;
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
async function request<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  let token: string;
  try {
    const { getAccessToken } = await import("zmp-sdk/apis");
    token = await getAccessToken({});
  } catch {
    throw new Error(
      "Vui lòng mở Mini App trong Zalo để xác thực và xem hội phí của bạn.",
    );
  }
  return apiRequest<T>("membership-fees/" + path, {
    method,
    headers: { Authorization: "Bearer " + token },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
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
