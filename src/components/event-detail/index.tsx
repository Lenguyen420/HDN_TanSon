import ArticleLayout from "@/components/shared/article-layout";
import type { ArticlePageProps } from "@/components/shared/page-props";
import { formatDate } from "@/components/shared/format";
import AppIcon from "@/components/icons";

export default function EventDetail(props: ArticlePageProps) {
  const event = props.article.event;
  return (
    <ArticleLayout {...props} category="events">
      {event && <>
        <section className="event-info-panel"><span className="overline">THÔNG TIN CHƯƠNG TRÌNH</span><div><span className="record-icon"><AppIcon name="calendar" /></span><p><strong>{formatDate(event.date)}</strong><span>{event.time}</span></p></div><div><span className="record-icon"><AppIcon name="building" /></span><p><strong>{event.venue}</strong><span>{event.address}</span></p></div></section>
        <section className="event-agenda"><h2>Lịch trình chương trình</h2><ol>{event.agenda.map((item) => <li key={item.time}><time>{item.time}</time><span>{item.title}</span></li>)}</ol></section>
      </>}
    </ArticleLayout>
  );
}
