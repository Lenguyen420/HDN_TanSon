import { useState } from "react";
import PageToolbar from "@/components/shared/page-toolbar";
import type { UtilityPageProps } from "@/components/shared/page-props";
import type { ActivityStatus } from "@/datas/types";
import ActivityFilters from "./activity-filters";
import ActivityRecord from "./activity-record";

export default function Activities({ data, onBack, onOpenArticle }: UtilityPageProps) {
  const [status, setStatus] = useState<"all" | ActivityStatus>("all");
  const visible = data.utilityPages.activities.filter((record) => status === "all" || record.status === status);
  return (
    <main className="activities-page activity-history-page">
      <PageToolbar title="Lịch sử tham gia" onBack={onBack} />
      <div className="activity-status-bar"><ActivityFilters value={status} onChange={setStatus} /></div>
      <div className="activity-history-body">
        {data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
        <div className="activity-history-list">{visible.map((record) => <ActivityRecord key={record.id} record={record} onOpen={(id) => onOpenArticle("events", id)} />)}</div>
        {visible.length === 0 && <div className="history-empty-panel" role="status">Chưa có dữ liệu phù hợp.</div>}
      </div>
    </main>
  );
}
