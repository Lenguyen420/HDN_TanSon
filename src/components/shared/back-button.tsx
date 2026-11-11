import AppIcon from "@/components/icons";

export default function BackButton({ onBack, label = "Quay lại" }: { onBack: () => void; label?: string }) {
  return <button className="page-back-button" type="button" onClick={onBack} aria-label={label}><AppIcon name="arrow" /></button>;
}
