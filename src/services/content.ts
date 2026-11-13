import type { BannerItem, ContentArticle, ContentCategory, Notification } from "@/datas/types";
import { legacyBannerImages } from "@/datas/legacy-banner-images";
import { apiRequest, getAllPublicItems, resolveApiImage } from "./api";
import type { ApiData } from "./api";

function mapArticle(article: ContentArticle): ContentArticle {
  const event = article.event;
  return {
    ...article, image: resolveApiImage(article.image),
    ...(event ? { event: {
      ...event,
      documents: event.documents?.map((file) => ({ ...file, url: resolveApiImage(file.url) || file.url })),
      minutes: event.minutes?.map((file) => ({ ...file, url: resolveApiImage(file.url) || file.url })),
    } } : {}),
  };
}

export async function getArticles(category: ContentCategory): Promise<ContentArticle[]> {
  return (await getAllPublicItems<ContentArticle>(category)).map(mapArticle);
}

export async function getArticle(category: ContentCategory, id: string): Promise<ContentArticle> {
  const result = await apiRequest<ApiData<ContentArticle>>(`public/${category}/${encodeURIComponent(id)}`);
  return mapArticle(result.data);
}

export async function getBanners(): Promise<BannerItem[]> {
  return (await getAllPublicItems<BannerItem>("banners")).map((banner) => ({
    ...banner,
    image: legacyBannerImages[banner.image?.replace(/^\/+/, "")] || resolveApiImage(banner.image) || "",
  }));
}

export async function getNotifications(): Promise<Notification[]> {
  // Backend không lưu trạng thái đọc theo người dùng; trạng thái này được lưu trên thiết bị.
  return (await getAllPublicItems<Omit<Notification, "unread">>("notification-feed")).map((notice) => ({ ...notice, scope: "public", image: resolveApiImage(notice.image), unread: true }));
}
