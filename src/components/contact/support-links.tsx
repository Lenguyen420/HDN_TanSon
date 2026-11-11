import AppIcon from "@/components/icons";
import type { UtilityPageData } from "@/datas/types";

interface SupportLinksProps { contact: UtilityPageData["contact"]; onMessage: (message: string) => void; }
export default function SupportLinks({ contact, onMessage }: SupportLinksProps) {
  const chatIcon = <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z" /><path d="M8 9h8M8 13h5" /></svg>;
  return (
    <div className="support-contact-links">
      {contact.hotlines.map((hotline) => <a key={hotline.id} className="support-contact-link" href={`tel:${hotline.number.replace(/\s/g, "")}`}><AppIcon name="phone" /><span>{hotline.label} · {hotline.number}</span></a>)}
      {contact.zaloUrl ? <a className="support-contact-link" href={contact.zaloUrl} target="_blank" rel="noreferrer">{chatIcon}<span>Zalo</span></a> : <button className="support-contact-link" type="button" onClick={() => onMessage("Kênh Zalo chính thức đang được cập nhật.")}>{chatIcon}<span>Zalo</span></button>}
      {contact.email ? <a className="support-contact-link" href={`mailto:${contact.email}`}><span className="support-mail-icon" aria-hidden="true">@</span><span>Email</span></a> : <button className="support-contact-link" type="button" onClick={() => onMessage("Email liên hệ đang được cập nhật.")}><span className="support-mail-icon" aria-hidden="true">@</span><span>Email</span></button>}
    </div>
  );
}
