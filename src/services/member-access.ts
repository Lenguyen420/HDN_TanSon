import type { Member } from "@/datas/types";
import { apiRequest } from "./api";
import type { ApiData, ApiList } from "./api";

export interface MemberIdentity {
  zaloUserId: string;
  linked: boolean;
  member: Member | null;
  user?: { id: string; name: string; avatar: string; phone: string | null };
  phoneNotice?: string;
}

export async function getMemberIdentity(token: string): Promise<MemberIdentity> {
  return (await apiRequest<ApiData<MemberIdentity>>("member/identity", { headers: { Authorization: `Bearer ${token}` } })).data;
}

export async function getMemberDirectory(token: string): Promise<Member[]> {
  const members: Member[] = [];
  for (let page = 1; ; page += 1) {
    const result = await apiRequest<ApiList<Member>>(`member/members?page=${page}&limit=100`, { headers: { Authorization: `Bearer ${token}` } });
    if (!Array.isArray(result.data) || !Number.isFinite(result.pagination?.total)) throw new Error("Danh bạ trả về không hợp lệ.");
    members.push(...result.data);
    if (members.length >= result.pagination.total) return members;
    if (!result.data.length) throw new Error("Chưa tải được đầy đủ danh bạ. Vui lòng thử lại.");
  }
}

export async function authenticateZaloMember() {
  // Token chỉ dùng trong lần xác thực này, không lưu vào localStorage.
  const { getAccessToken, authorize, getPhoneNumber, getSetting } = await import("zmp-sdk/apis");
  let token: string;
  let phoneToken: string | undefined;
  try {
    const { authSetting } = await getSetting({});
    const scopes: ("scope.userInfo" | "scope.userPhonenumber")[] = [];
    if (!authSetting["scope.userInfo"]) scopes.push("scope.userInfo");
    if (!authSetting["scope.userPhonenumber"]) scopes.push("scope.userPhonenumber");
    const granted = scopes.length ? { ...authSetting, ...await authorize({ scopes }) } : authSetting;
    if (!granted["scope.userInfo"]) throw new Error("Bạn cần cho phép chia sẻ tên và ảnh đại diện Zalo để tiếp tục.");
    token = await getAccessToken({});
    if (granted["scope.userPhonenumber"]) phoneToken = (await getPhoneNumber({})).token;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Bạn cần")) throw error;
    throw new Error("Chưa được cấp quyền Zalo. Vui lòng mở mini app trong Zalo và chọn Cho phép để tiếp tục.");
  }
  const identity = (await apiRequest<ApiData<MemberIdentity>>("member/session", {
    method: "POST", headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ phoneToken }),
  })).data;
  const members = identity.linked ? await getMemberDirectory(token) : [];
  return { identity, members };
}
