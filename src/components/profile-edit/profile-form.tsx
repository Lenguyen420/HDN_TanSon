import { useState } from "react";
import type { Member, ProfileEdits } from "@/datas/types";
import { profileFormValues, validateProfileEdits } from "@/services/profile";
import { registrationToday } from "@/services/registration";

interface ProfileFormProps { member: Member; onSave: (value: ProfileEdits) => void; onCancel: () => void; }
export default function ProfileForm({ member, onSave, onCancel }: ProfileFormProps) {
  const [values, setValues] = useState(() => profileFormValues(member));
  const [error, setError] = useState("");
  const update = (patch: Partial<ProfileEdits>) => { setValues((current) => ({ ...current, ...patch })); setError(""); };
  return (
    <form className="surface-card profile-editor-form" onSubmit={(event) => {
      event.preventDefault();
      const next = { ...values };
      for (const field of Object.keys(next) as (keyof ProfileEdits)[]) next[field] = next[field].trim();
      const validation = validateProfileEdits(next, registrationToday());
      if (validation) { setError(validation); return; }
      try { onSave(next); } catch { setError("Không thể lưu thay đổi trên thiết bị. Vui lòng thử lại."); }
    }}>
      <h2>Thông tin cá nhân</h2>
      <div className="form-field"><label htmlFor="profile-name">Họ và tên <span className="required-mark">*</span></label><input id="profile-name" autoComplete="name" required value={values.fullName} onChange={(event) => update({ fullName: event.target.value })} /></div>
      <div className="form-field"><label htmlFor="profile-birth">Ngày sinh</label><input id="profile-birth" type="date" max={registrationToday()} autoComplete="bday" value={values.birthDate} onChange={(event) => update({ birthDate: event.target.value })} /></div>
      <div className="form-field"><label htmlFor="profile-phone">Số điện thoại</label><input id="profile-phone" type="tel" autoComplete="tel" value={values.phone} onChange={(event) => update({ phone: event.target.value })} /></div>
      <div className="form-field"><label htmlFor="profile-email">Email</label><input id="profile-email" type="email" autoComplete="email" value={values.email} onChange={(event) => update({ email: event.target.value })} placeholder="example@gmail.com" /></div>
      <h2>Thông tin doanh nghiệp</h2>
      <div className="form-field"><label htmlFor="profile-company">Tên doanh nghiệp <span className="required-mark">*</span></label><input id="profile-company" autoComplete="organization" required value={values.company} onChange={(event) => update({ company: event.target.value })} /></div>
      <div className="form-field"><label htmlFor="profile-job">Chức vụ</label><input id="profile-job" autoComplete="organization-title" value={values.jobTitle} onChange={(event) => update({ jobTitle: event.target.value })} placeholder="Giám đốc / Nhân viên..." /></div>
      <div className="form-field"><label htmlFor="profile-address">Địa chỉ doanh nghiệp</label><textarea id="profile-address" rows={3} autoComplete="street-address" value={values.companyAddress} onChange={(event) => update({ companyAddress: event.target.value })} placeholder="Số nhà, đường, phường..." /></div>
      <p className="form-note">Mã hội viên, vai trò và trạng thái hội viên do Hội quản lý. Các thay đổi trên được lưu ở thiết bị, chưa gửi API.</p>
      {error && <p className="profile-edit-error" role="alert">{error}</p>}
      <div className="profile-form-actions"><button type="button" className="profile-cancel" onClick={onCancel}>Hủy</button><button type="submit" className="primary-button">Lưu thay đổi</button></div>
    </form>
  );
}
