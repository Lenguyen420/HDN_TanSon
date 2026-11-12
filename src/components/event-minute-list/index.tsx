import type { EventResourcePageProps } from "@/components/shared/page-props";
import EventPageLayout from "@/components/shared/event-page-layout";
import EventSummaryCard from "@/components/shared/event-summary-card";
import EventFileList from "@/components/shared/event-file-list";
export default function EventMinuteList({ article, onBack, onOpenEvent, onOpenFile }: EventResourcePageProps) {
  const files = article.event?.minutes || [];
  return <EventPageLayout title="Biên bản sự kiện" subtitle="Biên bản và kết luận của chương trình" onBack={onBack}><EventSummaryCard article={article} onSelect={(item) => onOpenEvent(item.id, "calendar")} /><div className="event-section-heading"><h2>Biên bản đã công bố</h2><span>{files.length} biên bản</span></div><EventFileList files={files} onOpen={onOpenFile} emptyText="Sự kiện chưa có biên bản được công bố." /></EventPageLayout>;
}
