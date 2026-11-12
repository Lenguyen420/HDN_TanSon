import type { ProfileEditPageProps } from "@/components/shared/page-props";
import PageToolbar from "@/components/shared/page-toolbar";
import ProfileForm from "./profile-form";

export default function ProfileEdit({ data, onBack, onSave }: ProfileEditPageProps) {
  const application = data.registrationProfile;
  const member = application ? application.member || {id:application.id,name:application.fullName,phone:application.phone,email:application.email,birthDate:application.birthDate,company:application.company,jobTitle:application.jobTitle,companyAddress:application.companyAddress,initials:"",position:"",isBoard:false} : data.members.find((item) => item.id === data.profile.memberId);
  return <main className="profile-edit-page"><PageToolbar title="Chỉnh sửa thông tin" subtitle="Cập nhật hồ sơ của bạn" onBack={onBack} /><div className="profile-edit-body">{member ? <ProfileForm member={member} taxCode={application?.taxCode || ""} remote={Boolean(application)} onSave={onSave} onCancel={onBack} /> : <p className="surface-card empty-state">Chưa có thông tin hội viên để chỉnh sửa.</p>}</div></main>;
}
