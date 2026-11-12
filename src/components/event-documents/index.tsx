import { useState } from "react";
import type { EventWorkspacePageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSearch from "@/components/shared/event-search";
import EventSummaryCard from "@/components/shared/event-summary-card";
import ContentCategories from "@/components/shared/content-categories";
import { matchesEvent, sortEvents } from "@/services/event-workspace";
export default function EventDocuments({ data, onBack, onOpenEvent }: EventWorkspacePageProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const events = sortEvents(data.content.events.articles).filter((article) => matchesEvent(article, query) && (filter === "all" || !!article.event?.documents?.length));
  return <EventPageLayout title="Tài liệu" subtitle="Chọn sự kiện để xem tài liệu" onBack={onBack}><EventSearch value={query} onChange={setQuery} /><ContentCategories value={filter} onChange={setFilter} items={[{ id: "all", title: "Tất cả" }, { id: "available", title: "Có tài liệu" }]} /><div className="event-section-heading"><h2>Danh sách sự kiện</h2><span>{events.length} sự kiện</span></div><div className="event-results">{events.map((article) => <div key={article.id}><EventSummaryCard article={article} onSelect={(item) => onOpenEvent(item.id, "documents")} /><p className="event-resource-count">{article.event?.documents?.length || 0} tài liệu</p></div>)}</div>{!events.length && <p className="event-workspace-empty">Không có sự kiện phù hợp.</p>}</EventPageLayout>;
}
