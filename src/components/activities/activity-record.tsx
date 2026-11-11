import type { ActivityRecord as Record } from "@/datas/types";
import { activityStatuses } from "@/datas/activity-statuses";
import { formatDate } from "@/components/shared/format";
import AppIcon from "@/components/icons";

export default function ActivityRecord({ record, onOpen }: { record: Record; onOpen: (id: string) => void }) {
  return (
    <article className="surface-card activity-record"><span className={`activity-record-status ${record.status}`}>{activityStatuses.find((status) => status.value === record.status)?.label}</span><h3>{record.title}</h3><p><AppIcon name="calendar" />{formatDate(record.date)}</p><p><AppIcon name="building" />{record.venue}</p><button className="text-button" type="button" onClick={() => onOpen(record.eventId)}>Xem sự kiện <AppIcon name="arrow" /></button></article>
  );
}
