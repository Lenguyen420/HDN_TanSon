export type NavigationTab = "register" | "members" | "home" | "notifications" | "profile";
export interface Association {
  name: string;
  locality: string;
  logo: string;
  slogan: string;
  greeting: string;
  oaDescription: string;
  oaNotice: string;
  memberSlogan?: string;
}
export interface BannerItem { id: string; image: string; alt: string; }
export type UtilityId = "about" | "fees" | "activities" | "sponsorships" | "contact" | "event-assistant";
export interface Utility { id: UtilityId; title: string; icon: string; description: string; }
export interface Member {
  id: string; name: string; position: string; company: string; initials: string; isBoard: boolean;
  jobTitle?: string;
  avatar?: string | null;
  birthDate?: string | null;
  phone?: string | null;
  email?: string | null;
  joinedAt?: string | null;
  companyAddress?: string | null;
}
export interface Notification {
  id: string; title: string; description: string; date: string; unread: boolean;
  category?: string;
  time?: string;
  image?: string | null;
  paragraphs?: string[];
  related?: { category: ContentCategory; articleId: string };
}
export interface MemberProfile { memberId: string; memberCode: string; joinedAt: string; status: string; }
export interface RegistrationCompany { id: string; name: string; }
export interface RegistrationData { companies: RegistrationCompany[]; }
export interface RegistrationDraft {
  fullName: string;
  phone: string;
  birthDate: string;
  email: string;
  companyId: string;
  unknownCompany: boolean;
  companyName: string;
  taxCode: string;
  companyAddress: string;
  position: string;
}
export type ContentCategory = "news" | "events" | "member-visits";
export interface ContentArticle {
  id: string;
  title: string;
  topic?: string;
  publishedAt: string;
  image?: string | null;
  summary: string;
  paragraphs: string[];
  author?: string;
  event?: { date: string; time: string; venue: string; address: string; agenda: { time: string; title: string }[] };
  visit?: { company: string; representative: string; date: string; address: string; field: string };
}
export interface ContentCollection {
  title: string;
  subtitle: string;
  articles: ContentArticle[];
}
export interface FeeRecord { id: string; year: number; title: string; amount: number; date: string; status: "paid" | "pending"; reference: string; }
export type ActivityStatus = "registered" | "attended" | "absent" | "cancelled";
export interface ActivityRecord { id: string; title: string; date: string; venue: string; status: ActivityStatus; eventId: string; }
export interface ProfileEdits {
  memberId: string;
  fullName: string;
  phone: string;
  email: string;
  birthDate: string;
  company: string;
  jobTitle: string;
  companyAddress: string;
  taxCode?: string;
}
export interface SponsorshipRecord { id: string; title: string; date: string; amount: number; kind: "cash" | "in-kind"; description: string; status: string; }
export interface UtilityPageData {
  about: { introduction: string; mission: string; values: { title: string; description: string }[]; fields: string[] };
  fees: FeeRecord[];
  activities: ActivityRecord[];
  sponsorships: SponsorshipRecord[];
  contact: { department: string; address: string; hours: string; phone: string | null; email: string | null; topics: string[]; hotlines: { id: string; label: string; number: string }[]; zaloUrl: string | null };
  assistant: { greeting: string; questions: { question: string; answer: string }[] };
}
export interface RegistrationProfile {
  id: string; fullName: string; company: string; phone: string; email?: string; birthDate?: string;
  jobTitle?: string; companyAddress?: string; taxCode?: string; date: string;
  status: "pending" | "approved" | "rejected"; createdAt: string; reviewedAt?: string; rejectionReason?: string;
  member: (Member & { status: "active" | "inactive"; updatedAt?: string }) | null;
}
export interface AppData {
  registrationProfile?: RegistrationProfile;
  zaloUser?: { id: string; name: string; avatar: string; phone: string | null };
  memberAccess?: "required" | "granted";
  isDemo: boolean;
  association: Association;
  banners: BannerItem[];
  utilities: Utility[];
  members: Member[];
  notifications: Notification[];
  profile: MemberProfile;
  content: Record<ContentCategory, ContentCollection>;
  utilityPages: UtilityPageData;
  registration: RegistrationData;
}
