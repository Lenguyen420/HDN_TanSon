import BackButton from "./back-button";

interface PageToolbarProps {
  title: string;
  onBack: () => void;
  subtitle?: string;
  headingLevel?: "h1" | "h2";
  sticky?: boolean;
}

export default function PageToolbar({ title, onBack, subtitle, headingLevel = "h1", sticky }: PageToolbarProps) {
  const Heading = headingLevel;
  return (
    <header className={`page-toolbar ${sticky ? "is-sticky" : ""}`}>
      <BackButton onBack={onBack} />
      <div className="page-toolbar-copy"><Heading>{title}</Heading>{subtitle && <p>{subtitle}</p>}</div>
    </header>
  );
}
