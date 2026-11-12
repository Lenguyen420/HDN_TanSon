import { useState } from "react";
import type { EventWorkspacePageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSearch from "@/components/shared/event-search";
import EventSummaryCard from "@/components/shared/event-summary-card";
import ContentCategories from "@/components/shared/content-categories";
import { matchesEvent, matchesEventPeriod, sortEvents } from "@/services/event-workspace";
export default function EventMinutes({ data, onBack, onOpenEvent }: EventWorkspacePageProps) {
  const [query, setQuery] = useState("");
  const [period, setPeriod] = useState("all");
  const events = sortEvents(data.content.events.articles).filter((article) => article.event?.minutes?.length && (matchesEvent(article, query) || article.event.minutes.some((file) => file.title.toLocaleLowerCase("vi").includes(query.toLocaleLowerCase("vi")))) && (period === "all" || article.event.minutes.some((file) => matchesEventPeriod(file.publishedAt || article.event?.date, period))));
  return <EventPageLayout title="Biên bản" subtitle="Tra cứu biên bản và kết luận sự kiện" onBack={onBack}><EventSearch value={query} onChange={setQuery} placeholder="Tìm biên bản, tên sự kiện…" /><ContentCategories value={period} onChange={setPeriod} items={[{ id: "all", title: "Tất cả" }, { id: "week", title: "Trong tuần" }, { id: "month", title: "Trong tháng" }]} /><div className="event-results">{events.map((article) => <EventSummaryCard key={article.id} article={article} onSelect={(item) => onOpenEvent(item.id, "minutes")} />)}</div>{!events.length && <div className="event-workspace-empty"><p>Không có biên bản phù hợp.</p><small>Biên bản sẽ hiển thị khi Ban tổ chức công bố.</small></div>}</EventPageLayout>;
}
