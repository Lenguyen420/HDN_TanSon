import { useEffect, useRef } from "react";
import type { Member } from "@/datas/types";
import AppIcon from "@/components/icons";
import { formatDate } from "@/components/shared/format";
import MemberPhoto from "@/components/shared/member-photo";

interface MemberDetailProps { member: Member; isDemo: boolean; onClose: () => void; }
export default function MemberDetail({ member, isDemo, onClose }: MemberDetailProps) {
  const dialog = useRef<HTMLDialogElement>(null);
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

  const rows = [
    { label: "Doanh nghiệp", value: member.company },
    { label: "Ngày thành lập", value: member.companyFoundedAt ? formatDate(member.companyFoundedAt) : "Chưa có" },
    { label: "Ngày sinh", value: member.birthDate ? formatDate(member.birthDate) : "Chưa có" },
    { label: "Số điện thoại", value: member.phone || "Chưa có" },
    { label: "Email", value: member.email || "Chưa có" },
    { label: "Ngày đăng ký", value: member.joinedAt ? formatDate(member.joinedAt) : "Chưa có" },
    { label: "Vai trò tại Hội", value: member.position },
  ];
  return (
    <dialog ref={dialog} className="member-detail-sheet" aria-labelledby="member-detail-name" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientY < bounds.top || event.clientX < bounds.left || event.clientX > bounds.right || event.clientY > bounds.bottom) onClose();
    }}>
      <span className="member-sheet-handle" aria-hidden="true" />
      <button type="button" className="member-sheet-close" aria-label="Đóng thông tin hội viên" autoFocus onClick={onClose}><AppIcon name="close" /></button>
      <div className="member-sheet-heading"><MemberPhoto member={member} /><div><h2 id="member-detail-name">{member.name}</h2><p>{member.jobTitle || member.position}</p>{isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}</div></div>
      <dl className="member-sheet-details">{rows.map((row) => <div key={row.label}><dt>{row.label}</dt><dd>{row.value}</dd></div>)}</dl>
    </dialog>
  );
}
