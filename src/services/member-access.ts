import type { Member } from "@/datas/types";
import { apiRequest } from "./api";
import type { ApiData, ApiList } from "./api";

export interface MemberIdentity {
  zaloUserId: string;
  linked: boolean;
  verificationStatus?: "unverified";
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

export async function saveZaloSdkProfile() {
  const { authorize, getSetting, getUserInfo } = await import("zmp-sdk/apis");
  let profile: { id: string; name: string; avatar?: string };
  try {
    const { authSetting } = await getSetting({});
    const granted = authSetting["scope.userInfo"] ? authSetting : await authorize({ scopes: ["scope.userInfo"] });
    if (!granted["scope.userInfo"]) throw new Error("Bạn cần cho phép chia sẻ tên và ảnh đại diện Zalo để tiếp tục.");
    profile = (await getUserInfo({ autoRequestPermission: false })).userInfo;
    if (!profile.id || !profile.name?.trim()) throw new Error("Zalo chưa trả tên và ảnh đại diện. Vui lòng thử lại.");
  } catch (error) {
    if (error instanceof Error && /^(Bạn cần|Zalo chưa)/.test(error.message)) throw error;
    throw new Error("Chưa được cấp quyền Zalo. Vui lòng mở mini app trong Zalo và chọn Cho phép để tiếp tục.");
  }
  const identity = (await apiRequest<ApiData<MemberIdentity>>("public/zalo-profiles", {
    method: "POST",
    body: JSON.stringify({ zaloUserId: profile.id, name: profile.name.trim(), avatar: profile.avatar || "" }),
  })).data;
  if (identity.verificationStatus !== "unverified" || !identity.user?.id || !identity.user.name)
    throw new Error("Chưa lưu được thông tin Zalo. Vui lòng thử lại.");
  // This is a saved SDK profile, not an authenticated member session.
  return { identity: { ...identity, linked: false, member: null }, members: [] as Member[] };
}
