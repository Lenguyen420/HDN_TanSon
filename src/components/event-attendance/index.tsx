import { useState } from "react";
import type { EventWorkspacePageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSearch from "@/components/shared/event-search";
import EventSummaryCard from "@/components/shared/event-summary-card";
import ContentCategories from "@/components/shared/content-categories";
import { matchesEvent, sortEvents } from "@/services/event-workspace";
export default function EventAttendance({ data, onBack, onOpenEvent, attendance, attendanceLoading, attendanceError }: EventWorkspacePageProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const events = sortEvents(data.content.events.articles).filter((article) => matchesEvent(article, query) && (filter === "all" || (filter === "checked" ? !!attendance[article.id] : !attendance[article.id])));
  return <EventPageLayout title="Điểm danh" subtitle="Xác nhận tham dự và xem lịch sử trên thiết bị này" onBack={onBack}><EventSearch value={query} onChange={setQuery} placeholder="Tìm sự kiện, địa điểm…" /><ContentCategories value={filter} onChange={setFilter} items={[{ id: "all", title: "Tất cả" }, { id: "checked", title: "Đã điểm danh" }, { id: "pending", title: "Chưa điểm danh" }]} />{attendanceLoading && <p role="status">Đang tải lịch sử điểm danh…</p>}{attendanceError && <p className="form-status" role="alert">{attendanceError}</p>}<div className="event-results">{events.map((article) => <EventSummaryCard key={article.id} article={article} badge={attendance[article.id] ? "Đã điểm danh" : "Chưa điểm danh"} onSelect={(item) => onOpenEvent(item.id, "attendance")} />)}</div>{!events.length && <p className="event-workspace-empty">Không có sự kiện phù hợp.</p>}</EventPageLayout>;
}
