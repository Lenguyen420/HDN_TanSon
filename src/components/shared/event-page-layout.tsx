import type { ReactNode } from "react";
import PageToolbar from "./page-toolbar";
export default function EventPageLayout({ title, subtitle, onBack, children }: { title: string; subtitle: string; onBack: () => void; children: ReactNode }) {
  return <main className="event-workspace"><PageToolbar title={title} subtitle={subtitle} onBack={onBack} sticky /><div className="event-workspace-body">{children}</div></main>;
}
