import { mockAppData } from "@/datas";
import type { AppData } from "@/datas/types";
import { useMockData } from "./api";
import { getArticles, getBanners, getNotifications } from "./content";
import { getAssociationSettings, parseAssistantQuestions } from "./settings";

export async function getAppData(): Promise<AppData> {
  if (useMockData) return mockAppData;
  const [settings, banners, news, events, visits, notifications] = await Promise.all([
    getAssociationSettings(), getBanners(), getArticles("news"), getArticles("events"), getArticles("member-visits"), getNotifications(),
  ]);
  return {
    isDemo: false,
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
    // Backend chưa có API public cho danh bạ, hồ sơ, hội phí và lịch sử cá nhân.
    members: [],
    profile: { memberId: "", memberCode: "", joinedAt: "", status: "" },
    registration: { companies: [] },
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
