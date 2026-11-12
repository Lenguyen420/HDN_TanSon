import { useState } from "react";
import type { EventWorkspacePageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSearch from "@/components/shared/event-search";
import EventSummaryCard from "@/components/shared/event-summary-card";
import ContentCategories from "@/components/shared/content-categories";
import { matchesEvent, matchesEventPeriod, sortEvents } from "@/services/event-workspace";
export default function EventCalendar({ data, onBack, onOpenEvent }: EventWorkspacePageProps) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const events = sortEvents(data.content.events.articles).filter((article) => matchesEvent(article, query) && matchesEventPeriod(article.event?.date, period));
  return <EventPageLayout title="Lịch sự kiện" subtitle="Tra cứu lịch và thông tin chương trình" onBack={onBack}><EventSearch value={query} onChange={setQuery} /><ContentCategories value={period} onChange={setPeriod} items={[{ id: "all", title: "Tất cả" }, { id: "upcoming", title: "Sắp diễn ra" }, { id: "past", title: "Đã diễn ra" }]} /><div className="event-section-heading"><h2>Danh sách sự kiện</h2><span>{events.length} sự kiện</span></div><div className="event-results">{events.map((article) => <EventSummaryCard key={article.id} article={article} onSelect={(item) => onOpenEvent(item.id, "calendar")} />)}</div>{!events.length && <p className="event-workspace-empty">Không có sự kiện phù hợp.</p>}</EventPageLayout>;
}
