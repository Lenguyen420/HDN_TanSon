import type { RegistrationDraft } from "@/datas/types";
import RegistrationField from "./registration-field";

export interface RegistrationFieldsProps {
  draft: RegistrationDraft;
  onChange: (patch: Partial<RegistrationDraft>) => void;
}

export default function PersonalFields({ draft, onChange, today }: RegistrationFieldsProps & { today: string }) {
  return (
    <>
      <RegistrationField id="register-full-name" label="Họ và tên" required>
        <input id="register-full-name" name="fullName" autoComplete="name" required placeholder="Nguyễn Văn A" value={draft.fullName} onChange={(event) => onChange({ fullName: event.target.value })} />
      </RegistrationField>
      <RegistrationField id="register-phone" label="Số điện thoại" required>
        <input id="register-phone" name="phone" type="tel" autoComplete="tel" required placeholder="Nhập số điện thoại" value={draft.phone} onChange={(event) => onChange({ phone: event.target.value })} />
      </RegistrationField>
      <RegistrationField id="register-birth-date" label="Ngày tháng năm sinh" required>
        <div className="member-date-control">
          <input id="register-birth-date" name="birthDate" type="date" autoComplete="bday" lang="vi" required max={today} value={draft.birthDate} onChange={(event) => onChange({ birthDate: event.target.value })} />
          <span className={draft.birthDate ? "member-date-display" : "member-date-display is-placeholder"} aria-hidden="true">{draft.birthDate ? draft.birthDate.split("-").reverse().join("/") : "dd/mm/yyyy"}</span>
        </div>
      </RegistrationField>
      <RegistrationField id="register-email" label="Email">
        <input id="register-email" name="email" type="email" autoComplete="email" placeholder="example@gmail.com" value={draft.email} onChange={(event) => onChange({ email: event.target.value })} />
      </RegistrationField>
    </>
  );
}
