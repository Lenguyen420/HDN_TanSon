import type { ContentArticle } from "@/datas/types";
import ContentListItem from "./content-list-item";
import AppIcon from "@/components/icons";
import { eventStatus } from "@/services/event-workspace";
import { formatDate } from "./format";
export default function EventSummaryCard({ article, onSelect, badge }: { article: ContentArticle; onSelect: (article: ContentArticle) => void; badge?: string }) {
  const date = article.event?.date;
  return <div className="event-summary-card"><div className="event-card-topline"><span className={`event-state ${badge === "Đã điểm danh" ? "is-attended" : badge ? "is-pending" : ""}`}>{badge || eventStatus(article)}</span><time dateTime={date}>{date ? formatDate(date) : "Chưa có lịch"}</time></div><ContentListItem article={article} categoryTitle="Sự kiện" onSelect={onSelect} /><div className="event-card-meta"><span><AppIcon name="calendar" />{article.event?.time || "Chưa cập nhật giờ"}</span><span><AppIcon name="user" />{article.event?.host || article.author || "Ban tổ chức Hội"}</span></div></div>;
}
