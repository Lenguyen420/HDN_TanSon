import type { AppData, Member, ProfileEdits } from "@/datas/types";

const storageKey = "tanson-profile-edits";
const editFields = ["memberId", "fullName", "phone", "email", "birthDate", "company", "jobTitle", "companyAddress"] as const;

export function readProfileEdits(): ProfileEdits | null {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) || "null");
    if (!value || typeof value !== "object" || Array.isArray(value) || !editFields.every((key) => typeof value[key] === "string")) return null;
    return editFields.reduce((result, key) => { result[key] = value[key]; return result; }, {} as ProfileEdits);
  } catch { return null; }
}

export function profileFormValues(member: Member): ProfileEdits {
  return { memberId: member.id, fullName: member.name, phone: member.phone || "", email: member.email || "", birthDate: member.birthDate || "", company: member.company, jobTitle: member.jobTitle || "", companyAddress: member.companyAddress || "" };
}

export function validateProfileEdits(value: ProfileEdits, today: string): string {
  if (!value.fullName.trim()) return "Vui lòng nhập họ và tên.";
  if (!value.company.trim()) return "Vui lòng nhập tên doanh nghiệp.";
  if (value.phone.trim()) {
    const digits = value.phone.replace(/\D/g, "");
    if (!/^[+\d\s().-]+$/.test(value.phone) || digits.length < 9 || digits.length > 15) return "Số điện thoại chưa hợp lệ.";
  }
  if (value.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email.trim())) return "Email chưa hợp lệ.";
  if (value.birthDate) {
    const date = new Date(`${value.birthDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value.birthDate) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value.birthDate || value.birthDate > today) return "Ngày sinh chưa hợp lệ.";
  }
  return "";
}

export function saveProfileEdits(value: ProfileEdits) {
  localStorage.setItem(storageKey, JSON.stringify(value));
}

export function applyProfileEdits(data: AppData, edits: ProfileEdits | null): AppData {
  if (!edits || edits.memberId !== data.profile.memberId) return data;
  return { ...data, members: data.members.map((member) => member.id !== edits.memberId ? member : {
    ...member, name: edits.fullName, initials: edits.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("").toLocaleUpperCase("vi"),
    phone: edits.phone || null, email: edits.email || null, birthDate: edits.birthDate || null,
    company: edits.company, jobTitle: edits.jobTitle, companyAddress: edits.companyAddress || null,
  }) };
}
