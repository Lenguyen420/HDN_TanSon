import type { UtilityPageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSummaryCard from "@/components/shared/event-summary-card";
import AppIcon from "@/components/icons";
import { eventToday, sortEvents } from "@/services/event-workspace";
import EventShortcuts from "./shortcuts";
export default function EventAssistant({ data, onBack, onOpenArticle, onOpenEventSection }: UtilityPageProps) {
  const events = sortEvents(data.content.events.articles);
  const upcoming = events.filter((article) => article.event?.date && article.event.date >= eventToday());
  const nearest = upcoming[0] || events[0];
  return <EventPageLayout title="Sự kiện" subtitle="Lịch chương trình, tài liệu và hoạt động của Hội" onBack={onBack}>
    <section className="event-hub-welcome"><span><AppIcon name="calendar" /></span><div><small>HỘI DOANH NGHIỆP PHƯỜNG TÂN SƠN</small><h2>Cùng kết nối, cùng tham gia</h2><p>{data.association.slogan}</p></div></section>
    <section className="event-hub-panel"><h2>Lối tắt</h2><EventShortcuts onSelect={(section) => onOpenEventSection?.(section)} /><p className="event-panel-caption">Thông tin và hồ sơ của từng sự kiện ở một nơi.</p></section>
    <section className="event-hub-panel"><div className="event-section-heading"><h2>{upcoming.length ? "Sự kiện gần nhất" : "Sự kiện gần đây"}</h2><span>{events.length} sự kiện</span></div>{nearest ? <EventSummaryCard article={nearest} onSelect={(article) => onOpenArticle("events", article.id)} /> : <p className="empty-state">Chưa có sự kiện được công bố.</p>}</section>
    <section className="event-hub-panel"><div className="event-section-heading"><h2>Sắp diễn ra</h2><button type="button" onClick={() => onOpenEventSection?.("calendar")}>Xem lịch <AppIcon name="arrow" /></button></div>{upcoming.slice(0, 3).map((article) => <EventSummaryCard key={article.id} article={article} onSelect={(item) => onOpenArticle("events", item.id)} />)}{!upcoming.length && <p className="empty-state">Lịch sự kiện mới sẽ được cập nhật tại đây.</p>}</section>
  </EventPageLayout>;
}
