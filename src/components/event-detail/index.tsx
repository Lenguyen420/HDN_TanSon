import ArticleLayout from "@/components/shared/article-layout";
import type { ArticlePageProps } from "@/components/shared/page-props";
import { formatDate } from "@/components/shared/format";
import AppIcon from "@/components/icons";
import { eventSections } from "@/datas/event-workspace";
import ParticipationCard from "./participation-card";

export default function EventDetail(props: ArticlePageProps) {
  const event = props.article.event;
  return (
    <ArticleLayout {...props} category="events">
      {props.onJoinEvent && <ParticipationCard article={props.article} participation={props.participation} loading={props.participationLoading} initialName={props.data.zaloUser?.name || ""} onJoin={(name, company) => props.onJoinEvent!(props.article.id, name, company)} />}
      <nav className="event-detail-shortcuts" aria-label="Chức năng sự kiện">{eventSections.filter((section) => section.id !== "calendar").map((section) => <button key={section.id} type="button" onClick={() => section.id !== "calendar" && props.onOpenEventResource?.(props.article.id, section.id)}><AppIcon name={section.icon} /><span>{section.title}</span></button>)}</nav>
      {event && <>
        <section className="event-info-panel"><span className="overline">THÔNG TIN CHƯƠNG TRÌNH</span><div><span className="record-icon"><AppIcon name="calendar" /></span><p><strong>{formatDate(event.date)}</strong><span>{event.time}</span></p></div><div><span className="record-icon"><AppIcon name="building" /></span><p><strong>{event.venue}</strong><span>{event.address}</span></p></div></section>
        <section className="event-agenda"><h2>Lịch trình chương trình</h2><ol>{event.agenda.map((item) => <li key={item.time}><time>{item.time}</time><span>{item.title}</span></li>)}</ol></section>
      </>}
    </ArticleLayout>
  );
}
