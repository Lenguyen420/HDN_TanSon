import type { Association } from "@/datas/types";
import PageToolbar from "./page-toolbar";

interface PageHeaderProps {
  association: Association;
  title: string;
  subtitle: string;
  headingLevel?: "h1" | "h2";
  onBack?: () => void;
}

export default function PageHeader({ association, title, subtitle, headingLevel = "h1", onBack }: PageHeaderProps) {
  if (onBack) return <PageToolbar title={title} subtitle={subtitle} headingLevel={headingLevel} onBack={onBack} />;
  const Heading = headingLevel;
  return (
    <header className="section-page-header">
      <span className="header-eyebrow">{association.name} {association.locality}</span>
      <Heading>{title}</Heading>
      <p>{subtitle}</p>
    </header>
  );
}
