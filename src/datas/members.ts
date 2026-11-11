import type { Member, MemberProfile } from "./types";

// Toàn bộ hồ sơ bên dưới là dữ liệu minh họa, không phải nhân sự chính thức.
export const members: Member[] = [
  { id: "member-1", name: "Nguyễn Minh An", position: "Chủ tịch Hội", jobTitle: "Giám đốc", company: "Công ty TNHH Minh An", initials: "MA", isBoard: true, avatar: null, birthDate: "1982-05-16", phone: "0911000001", email: "minhan@example.com", joinedAt: "2026-07-01" },
  { id: "member-2", name: "Trần Ngọc Anh", position: "Phó Chủ tịch Hội", jobTitle: "Phó giám đốc", company: "Công ty CP Ngọc Anh", initials: "NA", isBoard: true, avatar: null, birthDate: null, phone: "0911000002", email: "ngocanh@example.com", joinedAt: "2026-07-08" },
  { id: "member-3", name: "Lê Hoàng Nam", position: "Ủy viên Ban chấp hành", jobTitle: "Giám đốc kinh doanh", company: "Công ty TNHH Hoàng Nam", initials: "HN", isBoard: true, avatar: null, birthDate: "1986-11-20", phone: "0911000003", email: "hoangnam@example.com", joinedAt: "2026-08-15" },
  { id: "member-4", name: "Phạm Thanh Hà", position: "Hội viên", jobTitle: "Nhân viên", company: "Công ty TNHH Thanh Hà", initials: "TH", isBoard: false, avatar: null, birthDate: null, phone: "0911000004", email: null, joinedAt: "2026-10-01" },
];

export const profile: MemberProfile = {
  memberId: "member-4",
  memberCode: "TS-0004",
  joinedAt: "01/10/2026",
  status: "Đang hoạt động",
};
