import { useEffect, useRef, useState } from "react";
import type { UtilityPageData } from "@/datas/types";
import SupportLinks from "./support-links";

interface ContactDialogProps { contact: UtilityPageData["contact"]; isDemo: boolean; onClose: () => void; }
export default function ContactDialog({ contact, isDemo, onClose }: ContactDialogProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null;
    const page = document.querySelector<HTMLElement>(".association-page");
    const previousOverflow = page?.style.overflowY || "";
    if (page) page.style.overflowY = "hidden";
    dialog.current?.showModal();
    return () => {
      if (page) page.style.overflowY = previousOverflow;
      previousFocus?.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog ref={dialog} className="support-contact-dialog" aria-labelledby="support-contact-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const rect = event.currentTarget.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) onClose();
    }}>
      <h2 id="support-contact-title">Liên hệ hỗ trợ</h2>
      {isDemo && <p className="support-contact-demo">Thông tin liên hệ mẫu</p>}
      <SupportLinks contact={contact} onMessage={setMessage} />
      {message && <p className="support-contact-message" role="status">{message}</p>}
      <div className="support-contact-footer"><button type="button" autoFocus onClick={onClose}>Đóng</button></div>
    </dialog>
  );
}
