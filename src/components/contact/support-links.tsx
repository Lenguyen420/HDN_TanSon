import AppIcon from "@/components/icons";
import { isZaloMiniApp, openMiniAppWebview } from "@/services/mini-app";
import type { MouseEvent } from "react";
import type { UtilityPageData } from "@/datas/types";

interface SupportLinksProps { contact: UtilityPageData["contact"]; onMessage: (message: string) => void; }
export default function SupportLinks({ contact, onMessage }: SupportLinksProps) {
  const zaloUrl = contact.zaloUrl;
  const zaloNumber = zaloUrl?.match(/^https:\/\/zalo\.me\/(0\d{9})\/?$/i)?.[1];
  const openZalo = async (event: MouseEvent<HTMLAnchorElement>) => {
    if (!zaloUrl || !isZaloMiniApp()) return;
    event.preventDefault();
    onMessage("");
    try {
      await openMiniAppWebview(zaloUrl);
    } catch {
      onMessage(zaloNumber
        ? "Chưa mở được Zalo. Bạn có thể tìm số " + zaloNumber + " trong ứng dụng Zalo."
        : "Chưa mở được kênh Zalo. Vui lòng thử lại.");
      window.location.assign(zaloUrl);
    }
  };
  const chatIcon = <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 11.5a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.5-4.5A9 9 0 1 1 21 11.5Z" /><path d="M8 9h8M8 13h5" /></svg>;
  return (
    <div className="support-contact-links">
      {contact.hotlines.map((hotline) => <a key={hotline.id} className="support-contact-link" href={`tel:${hotline.number.replace(/\s/g, "")}`}><AppIcon name="phone" /><span>{hotline.label} · {hotline.number}</span></a>)}
      {zaloUrl ? (
        <a className="support-contact-link" href={zaloUrl} target="_blank" rel="noreferrer" onClick={openZalo}>
          {chatIcon}<span>{zaloNumber ? "Zalo · " + zaloNumber : "Zalo"}</span>
        </a>
      ) : (
        <button className="support-contact-link" type="button" onClick={() => onMessage("Kênh Zalo chính thức đang được cập nhật.")}>
          {chatIcon}<span>Zalo</span>
        </button>
      )}
      {contact.email ? <a className="support-contact-link" href={`mailto:${contact.email}`}><span className="support-mail-icon" aria-hidden="true">@</span><span>Email</span></a> : <button className="support-contact-link" type="button" onClick={() => onMessage("Email liên hệ đang được cập nhật.")}><span className="support-mail-icon" aria-hidden="true">@</span><span>Email</span></button>}
    </div>
  );
}
