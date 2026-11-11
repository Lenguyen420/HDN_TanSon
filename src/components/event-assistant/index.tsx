import { useState } from "react";
import UtilityLayout from "@/components/shared/utility-layout";
import ContentCard from "@/components/shared/content-card";
import type { UtilityPageProps } from "@/components/shared/page-props";
import AppIcon from "@/components/icons";

export default function EventAssistant({ data, onBack, onOpenArticle }: UtilityPageProps) {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const assistant = data.utilityPages.assistant;
  const events = data.content.events.articles.filter((event) => `${event.title} ${event.summary}`.toLocaleLowerCase("vi").includes(query.trim().toLocaleLowerCase("vi")));
  return (
    <UtilityLayout data={data} id="event-assistant" subtitle="Tìm chương trình phù hợp, kết nối dễ dàng hơn" onBack={onBack}>
      <section className="surface-card assistant-welcome"><span className="record-icon"><AppIcon name="calendar" /></span><div><span className="overline">TRỢ LÝ SỰ KIỆN</span><h2>Tôi có thể giúp gì cho bạn?</h2></div><p>{assistant.greeting}</p></section>
      <div className="assistant-questions">{assistant.questions.map((item) => <button type="button" key={item.question} aria-pressed={answer === item.answer} onClick={() => setAnswer(item.answer)}>{item.question}<AppIcon name="arrow" /></button>)}</div>
      {answer && <div className="assistant-answer" role="status"><AppIcon name="info" /><p>{answer}</p></div>}
      <label className="event-search">Tìm sự kiện<input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nhập tên chương trình hoặc chủ đề…" /></label>
      <div className="history-toolbar"><h2>Sự kiện dành cho bạn</h2><span className="result-count">{events.length} chương trình</span></div>
      <div className="assistant-events">{events.map((event) => <ContentCard key={event.id} article={event} onSelect={(article) => onOpenArticle("events", article.id)} />)}</div>
      {events.length === 0 && <p className="surface-card empty-state">Không tìm thấy sự kiện. Hãy thử từ khóa khác.</p>}
      <p className="page-footnote">Tra cứu và hướng dẫn dựa trên dữ liệu mẫu, chưa kết nối trợ lý AI hoặc đăng kí sự kiện trực tuyến.</p>
    </UtilityLayout>
  );
}
