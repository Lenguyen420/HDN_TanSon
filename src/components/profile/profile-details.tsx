import type { Member, MemberProfile } from "@/datas/types";
import { formatDate } from "@/components/shared/format";

interface ProfileDetailsProps { member: Member; profile: MemberProfile; }
export default function ProfileDetails({ member, profile }: ProfileDetailsProps) {
  const personal = [{ label: "Họ và tên", value: member.name }, { label: "Ngày sinh", value: member.birthDate ? formatDate(member.birthDate) : "Chưa có" }, { label: "Số điện thoại", value: member.phone || "Chưa có" }, { label: "Email", value: member.email || "Chưa có" }];
  const business = [{ label: "Doanh nghiệp", value: member.company }, { label: "Chức vụ", value: member.jobTitle || "Chưa có" }, { label: "Địa chỉ doanh nghiệp", value: member.companyAddress || "Chưa có" }];
  const membership = [{ label: "Mã hội viên", value: profile.memberCode }, { label: "Ngày gia nhập", value: profile.joinedAt }, { label: "Vai trò tại Hội", value: member.position }];
  return <div className="personal-detail-groups">{[{ title: "Thông tin cá nhân", rows: personal }, { title: "Thông tin doanh nghiệp", rows: business }, { title: "Thông tin hội viên", rows: membership }].map((section) => <section className="surface-card personal-detail-card" key={section.title}><h2>{section.title}</h2><dl>{section.rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl></section>)}</div>;
}
