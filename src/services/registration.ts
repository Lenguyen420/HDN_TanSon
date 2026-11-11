import type { RegistrationCompany, RegistrationDraft } from "@/datas/types";
import { apiRequest, useMockData } from "./api";

export interface RegistrationReceipt {
  data: { id: string; status: "pending" };
  message: string;
}

export async function submitRegistration(draft: RegistrationDraft, companies: RegistrationCompany[]): Promise<RegistrationReceipt> {
  if (useMockData) throw new Error("Đang dùng dữ liệu mẫu. Hãy tắt chế độ mẫu để gửi hồ sơ đến Hội.");
  if (!isRegistrationValid(draft, companies, registrationToday())) throw new Error("Vui lòng kiểm tra thông tin đăng ký.");
  const company = draft.unknownCompany ? draft.companyName.trim() : companies.find((item) => item.id === draft.companyId)?.name;
  return apiRequest<RegistrationReceipt>("public/registrations", {
    method: "POST",
    body: JSON.stringify({
      fullName: draft.fullName.trim(), phone: draft.phone.trim(), birthDate: draft.birthDate,
      email: draft.email.trim(), company, jobTitle: draft.position.trim(),
      taxCode: draft.unknownCompany ? draft.taxCode.trim() : "",
      companyAddress: draft.unknownCompany ? draft.companyAddress.trim() : "",
    }),
  });
}

export function clearRegistrationDraft() {
  localStorage.removeItem(draftKey);
}

const draftKey = "tanson-registration-draft";
const emptyDraft: RegistrationDraft = {
  fullName: "", phone: "", birthDate: "", email: "", companyId: "", unknownCompany: false,
  companyName: "", taxCode: "", companyAddress: "", position: "",
};

export function readRegistrationDraft(companies: RegistrationCompany[]): RegistrationDraft {
  try {
    const value = JSON.parse(localStorage.getItem(draftKey) || "{}");
    if (!value || typeof value !== "object" || Array.isArray(value)) return { ...emptyDraft, unknownCompany: !companies.length };
    const draft = { ...emptyDraft };
    for (const key of Object.keys(emptyDraft) as (keyof RegistrationDraft)[]) {
      if (key === "unknownCompany") draft.unknownCompany = value.unknownCompany === true;
      else if (typeof value[key] === "string") draft[key] = value[key];
    }
    // Giữ dữ liệu từ phiên bản form cũ (fullName, phone, company).
    if (!draft.companyId && !draft.companyName && typeof value.company === "string" && value.company.trim()) {
      const matched = companies.find((company) => company.name === value.company.trim());
      if (matched) draft.companyId = matched.id;
      else { draft.unknownCompany = true; draft.companyName = value.company.trim(); }
    }
    // Chưa có API công khai lấy danh sách doanh nghiệp: cho phép nhập trực tiếp.
    if (!companies.length) draft.unknownCompany = true;
    return draft;
  } catch {
    return { ...emptyDraft, unknownCompany: !companies.length };
  }
}

export function saveRegistrationDraft(draft: RegistrationDraft) {
  localStorage.setItem(draftKey, JSON.stringify(draft));
}

export function registrationToday() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
}

export function isRegistrationValid(draft: RegistrationDraft, companies: RegistrationCompany[], today: string) {
  const phone = draft.phone.trim();
  const digits = phone.replace(/\D/g, "");
  const validPhone = /^[+\d\s().-]+$/.test(phone) && digits.length >= 9 && digits.length <= 15;
  const date = new Date(`${draft.birthDate}T00:00:00Z`);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(draft.birthDate) && !Number.isNaN(date.getTime())
    && date.toISOString().slice(0, 10) === draft.birthDate && draft.birthDate <= today;
  const validEmail = !draft.email.trim() || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim());
  const validCompany = draft.unknownCompany ? Boolean(draft.companyName.trim()) : companies.some((company) => company.id === draft.companyId);
  return Boolean(draft.fullName.trim() && validPhone && validDate && validEmail && validCompany);
}
