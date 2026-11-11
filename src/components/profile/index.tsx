import type { ProfilePageProps } from "@/components/shared/page-props";
import PageToolbar from "@/components/shared/page-toolbar";
import ProfileDetails from "./profile-details";
import MemberPhoto from "@/components/shared/member-photo";
import AppIcon from "@/components/icons";

export default function Profile({ data, onBack, onEdit, saveMessage }: ProfilePageProps) {
  const member = data.members.find((item) => item.id === data.profile.memberId);
  return (
    <main className="profile-page personal-workspace">
      <PageToolbar title="Cá nhân" subtitle={data.association.slogan} onBack={onBack} />
      <div className="personal-workspace-body">
        {saveMessage && <p className="profile-save-message" role="status">{saveMessage}</p>}
        {member ? <>
          <section className="personal-summary"><MemberPhoto member={member} /><div><span className="overline">HỒ SƠ HỘI VIÊN</span><h2>{member.name}</h2><p>{member.jobTitle || member.position}</p><span className="status-pill success">{data.profile.status}</span></div></section>
          <button className="profile-edit-button" type="button" onClick={onEdit}><AppIcon name="register" />Chỉnh sửa thông tin<AppIcon name="arrow" /></button>
          {data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
          <ProfileDetails member={member} profile={data.profile} />
          <p className="page-footnote">Thông tin chỉnh sửa được lưu trên thiết bị và đồng bộ với danh bạ trong giao diện này. Chưa gửi đến hệ thống của Hội.</p>
        </> : <p className="surface-card empty-state">Chưa có thông tin hồ sơ hội viên.</p>}
      </div>
    </main>
  );
}
