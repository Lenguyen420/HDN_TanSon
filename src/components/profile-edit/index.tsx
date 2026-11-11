import type { ProfileEditPageProps } from "@/components/shared/page-props";
import PageToolbar from "@/components/shared/page-toolbar";
import ProfileForm from "./profile-form";

export default function ProfileEdit({ data, onBack, onSave }: ProfileEditPageProps) {
  const member = data.members.find((item) => item.id === data.profile.memberId);
  return <main className="profile-edit-page"><PageToolbar title="Chỉnh sửa thông tin" subtitle="Cập nhật hồ sơ của bạn" onBack={onBack} /><div className="profile-edit-body">{member ? <ProfileForm member={member} onSave={onSave} onCancel={onBack} /> : <p className="surface-card empty-state">Chưa có thông tin hội viên để chỉnh sửa.</p>}</div></main>;
}
