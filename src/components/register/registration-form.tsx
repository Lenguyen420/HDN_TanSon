import { useRef, useState } from "react";
import type { RegistrationData, RegistrationDraft } from "@/datas/types";
import { clearRegistrationDraft, isRegistrationValid, readRegistrationDraft, registrationToday, submitRegistration } from "@/services/registration";
import PersonalFields from "./personal-fields";
import CompanyFields from "./company-fields";

interface RegistrationFormProps { registration: RegistrationData; }
export default function RegistrationForm({ registration }: RegistrationFormProps) {
  const [draft, setDraft] = useState(() => readRegistrationDraft(registration.companies));
  const [status, setStatus] = useState("");
  const [hasError, setHasError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const inFlight = useRef(false);
  const today = registrationToday();
  const valid = isRegistrationValid(draft, registration.companies, today);
  const updateDraft = (patch: Partial<RegistrationDraft>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setStatus("");
    setHasError(false);
    setSubmitted(false);
  };

  return (
    <form
      className="member-registration-form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (!valid || inFlight.current || submitted) return;
        inFlight.current = true;
        setSubmitting(true);
        setStatus("");
        const normalized = { ...draft };
        for (const key of Object.keys(normalized) as (keyof RegistrationDraft)[]) {
          if (key !== "unknownCompany") normalized[key] = normalized[key].trim();
        }
        try {
          const receipt = await submitRegistration(normalized, registration.companies);
          // Lỗi bộ nhớ thiết bị không làm mất kết quả gửi thành công từ máy chủ.
          try { clearRegistrationDraft(); } catch { /* Có thể tiếp tục khi bộ nhớ bị chặn. */ }
          setHasError(false);
          setSubmitted(true);
          setStatus(receipt.message || "Đã tiếp nhận hồ sơ. Vui lòng chờ Hội xét duyệt.");
        } catch (error) {
          setHasError(true);
          setStatus(error instanceof Error ? error.message : "Không thể gửi hồ sơ. Vui lòng thử lại.");
        } finally {
          inFlight.current = false;
          setSubmitting(false);
        }
      }}
    >
      <fieldset className="member-registration-fields" disabled={submitting}>
        <PersonalFields draft={draft} onChange={updateDraft} today={today} />
        <CompanyFields draft={draft} onChange={updateDraft} companies={registration.companies} />
      </fieldset>
      <p className="register-draft-note" id="register-draft-note">Các trường có dấu <span aria-hidden="true">*</span> là bắt buộc. Hồ sơ được gửi đến Hội để xét duyệt.</p>
      <button className="register-submit" type="submit" disabled={!valid || submitting || submitted} aria-describedby="register-draft-note">{submitting ? "Đang gửi…" : submitted ? "Đã gửi đăng ký" : "Gửi đăng ký"}</button>
      {status && <p className={`registration-result ${hasError ? "is-error" : ""}`} role="status">{status}</p>}
    </form>
  );
}
