import type { UtilityPageProps } from "@/components/shared/page-props";
import ContactDialog from "./contact-dialog";

export default function Contact({ data, onBack }: UtilityPageProps) {
  return <ContactDialog contact={data.utilityPages.contact} isDemo={data.isDemo} onClose={onBack} />;
}
