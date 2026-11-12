import AppIcon from "@/components/icons";
import { eventSections, type EventSection } from "@/datas/event-workspace";
export default function EventShortcuts({ onSelect }: { onSelect: (section: EventSection) => void }) {
  return <div className="event-shortcuts">{eventSections.map((section) => <button key={section.id} type="button" onClick={() => onSelect(section.id)}><span><AppIcon name={section.icon} /></span><strong>{section.title}</strong></button>)}</div>;
}
