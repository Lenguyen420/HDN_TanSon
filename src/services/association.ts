import { mockAppData } from "@/datas";
import type { AppData } from "@/datas/types";
import { getAllPublicItems } from "./api";
import type { Member } from "@/datas/types";
import { useMockData } from "./api";
import { getArticles, getBanners, getNotifications } from "./content";
import { getAssociationSettings, parseAssistantQuestions } from "./settings";

export async function getAppData(): Promise<AppData> {
  if (useMockData) return mockAppData;
  const [settings, banners, news, events, visits, notifications, members] = await Promise.all([
    getAssociationSettings(), getBanners(), getArticles("news"), getArticles("events"), getArticles("member-visits"), getNotifications(), getAllPublicItems<Member>("members"),
  ]);
  return {
    isDemo: false,
    memberAccess: "granted",
    // Giữ thương hiệu, slogan và logo thống nhất theo cấu hình của mini app.
    association: mockAppData.association,
    utilities: mockAppData.utilities,
    banners,
    notifications,
    content: {
      news: { ...mockAppData.content.news, articles: news },
      events: { ...mockAppData.content.events, articles: events },
      "member-visits": { ...mockAppData.content["member-visits"], articles: visits },
    },
    // Danh bạ công khai; không gán danh tính cá nhân khi chưa có tài khoản.
    members,
    profile: { memberId: "", memberCode: "", joinedAt: "", status: "" },
    registration: { companies: members.filter((member, index) => members.findIndex((item) => item.company === member.company) === index).map((member) => ({ id: member.id, name: member.company })) },
    utilityPages: {
      about: { ...mockAppData.utilityPages.about, introduction: settings.introduction, mission: settings.mission },
      fees: [], activities: [], sponsorships: [],
      contact: {
        ...mockAppData.utilityPages.contact,
        department: settings.department, address: settings.address, hours: settings.hours,
        phone: settings.phone || null, email: settings.email || null, zaloUrl: settings.zaloUrl || null,
        hotlines: settings.phone ? [{ id: "association-phone", label: "Hotline", number: settings.phone }] : [],
      },
      assistant: { greeting: settings.assistantGreeting, questions: parseAssistantQuestions(settings.assistantQuestions) },
    },
  };
}
