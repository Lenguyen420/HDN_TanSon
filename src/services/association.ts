import { mockAppData } from "@/datas";
import type {
  AppData,
  BannerItem,
  ContentArticle,
  Notification,
} from "@/datas/types";
import { getAllPublicItems, resolveApiImage } from "./api";
import type { Member } from "@/datas/types";
import { useMockData } from "./api";
import { getArticles, getBanners, getNotifications } from "./content";
import { getAssociationSettings, parseAssistantQuestions } from "./settings";
import type { AssociationSettings } from "./settings";

const loaders = {
  settings: getAssociationSettings,
  banners: getBanners,
  news: () => getArticles("news"),
  events: () => getArticles("events"),
  visits: () => getArticles("member-visits"),
  notifications: getNotifications,
  members: async () => (await getAllPublicItems<Member>("members")).map(member=>({...member,...(member.avatar?{avatar:resolveApiImage(member.avatar)||""}:{})})),
};
export type AppResource = keyof typeof loaders;
const cache = new Map<
  AppResource,
  { value?: unknown; expires: number; pending?: Promise<unknown> }
>();
async function loadResource(key: AppResource) {
  let entry = cache.get(key);
  if (entry?.value !== undefined && entry.expires > Date.now()) return;
  if (entry?.pending) {
    await entry.pending;
    return;
  }
  if (!entry) {
    entry = { expires: 0 };
    cache.set(key, entry);
  }
  const target = entry;
  target.pending = loaders[key]().then(
    (value) => {
      target.value = value;
      target.expires = Date.now() + 30_000;
      target.pending = undefined;
    },
    (error) => {
      target.pending = undefined;
      throw error;
    },
  );
  await target.pending;
}
function buildAppData(): AppData {
  if (useMockData) return mockAppData;
  const settings = (cache.get("settings")?.value ?? {
    introduction: "",
    mission: "",
    department: "",
    address: "",
    hours: "",
    phone: "",
    email: "",
    zaloUrl: "",
    assistantGreeting: "",
    assistantQuestions: "",
  }) as AssociationSettings;
  const banners = (cache.get("banners")?.value ?? []) as BannerItem[];
  const news = (cache.get("news")?.value ?? []) as ContentArticle[];
  const events = (cache.get("events")?.value ?? []) as ContentArticle[];
  const visits = (cache.get("visits")?.value ?? []) as ContentArticle[];
  const notifications = (cache.get("notifications")?.value ??
    []) as Notification[];
  const members = (cache.get("members")?.value ?? []) as Member[];
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
      "member-visits": {
        ...mockAppData.content["member-visits"],
        articles: visits,
      },
    },
    // Danh bạ công khai; không gán danh tính cá nhân khi chưa có tài khoản.
    members,
    profile: { memberId: "", memberCode: "", joinedAt: "", status: "" },
    registration: {
      companies: members
        .filter(
          (member, index) =>
            members.findIndex((item) => item.company === member.company) ===
            index,
        )
        .map((member) => ({ id: member.id, name: member.company, ...(member.companyFoundedAt ? { companyFoundedAt: member.companyFoundedAt } : {}) })),
    },
    utilityPages: {
      about: {
        ...mockAppData.utilityPages.about,
        introduction: settings.introduction,
        introductionVideoUrl: settings.introductionVideoUrl || "",
        mission: settings.mission,
      },
      fees: [],
      activities: [],
      sponsorships: [],
      contact: {
        ...mockAppData.utilityPages.contact,
        department: settings.department,
        address: settings.address,
        hours: settings.hours,
        phone: settings.phone || null,
        email: settings.email || null,
        zaloUrl: settings.zaloUrl || null,
        hotlines: settings.phone
          ? [
              {
                id: "association-phone",
                label: "Hotline",
                number: settings.phone,
              },
            ]
          : [],
      },
      assistant: {
        greeting: settings.assistantGreeting,
        questions: parseAssistantQuestions(settings.assistantQuestions),
      },
    },
  };
}

export async function getAppData(
  options: {
    resources?: AppResource[];
    force?: boolean;
    onUpdate?: (data: AppData) => void;
  } = {},
): Promise<AppData> {
  if (useMockData) return mockAppData;
  const resources = [
    ...new Set(options.resources ?? (Object.keys(loaders) as AppResource[])),
  ];
  if (options.force) for (const key of resources) cache.delete(key);
  const results = await Promise.all(
    resources.map(async (key) => {
      try {
        await loadResource(key);
        options.onUpdate?.(buildAppData());
        return { ok: true };
      } catch (error) {
        return { ok: false, error };
      }
    }),
  );
  const failed = results.find((result) => !result.ok);
  if (failed && "error" in failed) throw failed.error;
  return buildAppData();
}
