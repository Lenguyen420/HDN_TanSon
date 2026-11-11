import type { ReactNode } from "react";

interface RegistrationFieldProps { id: string; label: string; required?: boolean; children: ReactNode; }
export default function RegistrationField({ id, label, required, children }: RegistrationFieldProps) {
  return (
    <div className="member-registration-field">
      <label htmlFor={id}>{label}{required && <span className="required-mark" aria-hidden="true"> *</span>}</label>
      {children}
    </div>
  );
}
