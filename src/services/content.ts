import type { BannerItem, ContentArticle, ContentCategory, Notification } from "@/datas/types";
import { apiRequest, getAllPublicItems, resolveApiImage } from "./api";
import type { ApiData } from "./api";

function mapArticle(article: ContentArticle): ContentArticle {
  return { ...article, image: resolveApiImage(article.image) };
}

export async function getArticles(category: ContentCategory): Promise<ContentArticle[]> {
  return (await getAllPublicItems<ContentArticle>(category)).map(mapArticle);
}

export async function getArticle(category: ContentCategory, id: string): Promise<ContentArticle> {
  const result = await apiRequest<ApiData<ContentArticle>>(`public/${category}/${encodeURIComponent(id)}`);
  return mapArticle(result.data);
}

export async function getBanners(): Promise<BannerItem[]> {
  return (await getAllPublicItems<BannerItem>("banners")).map((banner) => ({ ...banner, image: resolveApiImage(banner.image) || "" }));
}

export async function getNotifications(): Promise<Notification[]> {
  // Backend không lưu trạng thái đọc theo người dùng; trạng thái này được lưu trên thiết bị.
  return (await getAllPublicItems<Omit<Notification, "unread">>("notifications")).map((notice) => ({ ...notice, unread: true }));
}
