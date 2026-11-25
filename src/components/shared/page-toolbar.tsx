import BackButton from "./back-button";

interface PageToolbarProps {
  title: string;
  onBack: () => void;
  subtitle?: string;
  headingLevel?: "h1" | "h2";
  sticky?: boolean;
  banner?: { src: string; alt: string; width: number; height: number };
}

export default function PageToolbar({ title, onBack, subtitle, headingLevel = "h1", sticky, banner }: PageToolbarProps) {
  const Heading = headingLevel;
  return (
    <header className={["page-toolbar", sticky && "is-sticky", banner && "page-toolbar-with-banner"].filter(Boolean).join(" ")}>
      {banner && <img className="page-toolbar-banner" {...banner} />}
      <BackButton onBack={onBack} />
      <div className={banner ? "sr-only" : "page-toolbar-copy"}><Heading>{title}</Heading>{subtitle && <p>{subtitle}</p>}</div>
    </header>
  );
}
