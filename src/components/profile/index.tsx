import type { ProfilePageProps } from "@/components/shared/page-props";
import PageToolbar from "@/components/shared/page-toolbar";
import ProfileDetails from "./profile-details";
import MemberPhoto from "@/components/shared/member-photo";
import AppIcon from "@/components/icons";
import RegistrationProfileDetails from "./registration-profile";

export default function Profile({ data, onBack, onEdit, saveMessage }: ProfilePageProps) {
  const member = data.members.find((item) => item.id === data.profile.memberId);
  return (
    <main className="profile-page personal-workspace">
      <PageToolbar title="Cá nhân" subtitle={data.association.slogan} onBack={onBack} />
      <div className="personal-workspace-body">
        {saveMessage && <p className="profile-save-message" role="status">{saveMessage}</p>}
        {!data.registrationProfile && data.zaloUser && <section className="surface-card">
          <div className="personal-summary"><MemberPhoto member={{ id: data.zaloUser.id, name: data.zaloUser.name, avatar: data.zaloUser.avatar, initials: data.zaloUser.name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join(""), company: "", position: "", isBoard: false }} /><div><h2>{data.zaloUser.name}</h2><p>Tài khoản Zalo</p></div></div>
          <p>Số điện thoại: {data.zaloUser.phone || "Chưa chia sẻ"}</p>
          <p>{member ? "Tài khoản đã liên kết với hồ sơ hội viên bên dưới." : "Tên và ảnh Zalo đã được lưu. Tài khoản chưa xác minh hoặc liên kết hội viên."}</p>
        </section>}
        {data.registrationProfile ? <RegistrationProfileDetails application={data.registrationProfile} avatar={data.zaloUser?.avatar} /> : member ? <>
          <section className="personal-summary"><MemberPhoto member={member} /><div><span className="overline">HỒ SƠ HỘI VIÊN</span><h2>{member.name}</h2><p>{member.jobTitle || member.position}</p><span className="status-pill success">{data.profile.status}</span></div></section>
          <button className="profile-edit-button" type="button" onClick={onEdit}><AppIcon name="register" />Chỉnh sửa thông tin<AppIcon name="arrow" /></button>
          {data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
          <ProfileDetails member={member} profile={data.profile} />
          <p className="page-footnote">Thông tin chỉnh sửa được lưu trên thiết bị và đồng bộ với danh bạ trong giao diện này. Chưa gửi đến hệ thống của Hội.</p>
        </> : !data.zaloUser && <p className="surface-card empty-state">Bạn đang xem ứng dụng ở chế độ khách. Chưa có hồ sơ cá nhân để hiển thị.</p>}
      </div>
    </main>
  );
}
