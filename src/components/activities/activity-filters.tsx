import { activityStatuses } from "@/datas/activity-statuses";
import type { ActivityStatus } from "@/datas/types";

interface ActivityFiltersProps { value: "all" | ActivityStatus; onChange: (value: "all" | ActivityStatus) => void; }
export default function ActivityFilters({ value, onChange }: ActivityFiltersProps) {
  return <div className="activity-status-filters" role="group" aria-label="Trạng thái tham gia">{activityStatuses.map((option) => <button className={`activity-filter ${option.value} ${value === option.value ? "is-selected" : ""}`} type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}
