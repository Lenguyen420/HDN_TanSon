import type { EventResourcePageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSummaryCard from "@/components/shared/event-summary-card";
import EventFileList from "@/components/shared/event-file-list";
export default function EventDocumentList({ article, onBack, onOpenEvent, onOpenFile }: EventResourcePageProps) {
  const files = article.event?.documents || [];
  return <EventPageLayout title="Tài liệu sự kiện" subtitle="Tài liệu do Ban tổ chức công bố" onBack={onBack}><EventSummaryCard article={article} onSelect={(item) => onOpenEvent(item.id, "calendar")} /><div className="event-section-heading"><h2>Tài liệu chương trình</h2><span>{files.length} tài liệu</span></div><EventFileList files={files} onOpen={onOpenFile} emptyText="Sự kiện chưa có tài liệu được công bố." /></EventPageLayout>;
}
