import type { ReactNode } from "react";
import AppIcon, { IconName } from "@/components/icons";

interface PageCardProps {
  icon: IconName;
  title: string;
  description: string;
  isDemo?: boolean;
  children: ReactNode;
}

export default function PageCard({ icon, title, description, isDemo, children }: PageCardProps) {
  return (
    <section className="section-page-card">
      <div className="section-page-icon"><AppIcon name={icon} /></div>
      <h2>{title}</h2>
      <p>{description}</p>
      {isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
      {children}
    </section>
  );
}
