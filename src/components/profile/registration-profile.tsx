import type { RegistrationProfile } from "@/datas/types";
import { formatDate } from "@/components/shared/format";
import MemberPhoto from "@/components/shared/member-photo";
const states = { pending: "Đang chờ duyệt", approved: "Đã được duyệt", rejected: "Chưa được chấp thuận" };
export default function RegistrationProfileDetails({ application, avatar }: { application: RegistrationProfile; avatar?: string }) {
  const member = application.status === "approved" ? application.member : null;
  const name = member?.name || application.fullName;
  const personal = [
    ["Họ và tên", name], ["Ngày sinh", formatDate((member ? member.birthDate : application.birthDate) || "")],
    ["Số điện thoại", member ? member.phone : application.phone], ["Email", member ? member.email : application.email],
  ];
  const business = [["Doanh nghiệp", member?.company || application.company], ["Chức vụ", member ? member.jobTitle : application.jobTitle],
    ["Địa chỉ doanh nghiệp", member ? member.companyAddress : application.companyAddress], ["Mã số thuế đã đăng ký", application.taxCode]];
  const system = [["Mã hồ sơ đăng ký", application.id], ["Ngày đăng ký", formatDate(application.date)],
    ["Kết quả xét duyệt", states[application.status]], ["Thời điểm xét duyệt", application.reviewedAt ? new Date(application.reviewedAt).toLocaleString("vi-VN") : "Đang chờ"],
    ...(member ? [["Mã hội viên", member.id], ["Ngày gia nhập", formatDate(member.joinedAt || "")], ["Trạng thái hội viên", member.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động"], ["Vai trò tại Hội", member.position], ["Ban chấp hành", member.isBoard ? "Có" : "Không"]] : [])];
  return <>
    <section className="personal-summary"><MemberPhoto member={{ id: application.id, name, avatar, initials: name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join(""), company: application.company, position: member?.position || "", isBoard: member?.isBoard || false }}/><div><span className="overline">{member ? "HỒ SƠ HỘI VIÊN" : "HỒ SƠ ĐĂNG KÝ"}</span><h2>{name}</h2><p>{member?.company || application.company}</p><span className={"status-pill" + (application.status === "approved" ? " success" : "")}>{states[application.status]}</span></div></section>
    {application.status === "rejected" && <section className="surface-card"><h2>Lý do chưa được chấp thuận</h2><p>{application.rejectionReason || "Vui lòng liên hệ Ban thư ký Hội để được hướng dẫn."}</p></section>}
    <div className="personal-detail-groups">{[{title:"Thông tin cá nhân", rows:personal},{title:"Thông tin doanh nghiệp",rows:business},{title:"Thông tin hệ thống",rows:system}].map((group) => <section key={group.title} className="surface-card personal-detail-card"><h2>{group.title}</h2><dl>{group.rows.map(([label,value]) => <div key={label}><dt>{label}</dt><dd>{value || "Chưa có"}</dd></div>)}</dl></section>)}</div>
    <p className="page-footnote">Thông tin hồ sơ và kết quả xét duyệt được cập nhật từ hệ thống của Hội.</p>
  </>;
}
