import { useState } from "react";
import type { ContentArticle } from "@/datas/types";
import type { EventParticipation } from "@/services/event-workspace";
import { eventJoinWindow } from "@/services/event-workspace";
import AppIcon from "@/components/icons";
export default function ParticipationCard({ article, participation, loading, initialName, onJoin }: { article: ContentArticle; participation?: EventParticipation; loading?: boolean; initialName: string; onJoin: (name: string, company: string) => Promise<{ persisted: boolean }> }) {
  const [name, setName] = useState(initialName);
  const [company, setCompany] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const schedule = eventJoinWindow(article);
  const open = schedule && new Date() < schedule.start;
  if (loading) return <section className="event-participation-card" role="status">Đang kiểm tra đăng ký tham gia…</section>;
  if (participation?.registeredAt) return <section className="event-participation-card"><h2><AppIcon name="check" />{participation.status === "attended" ? "Đã điểm danh tham dự" : participation.status === "absent" ? "Vắng mặt" : "Đã đăng ký tham gia"}</h2><p>{participation.name}{participation.company ? ` · ${participation.company}` : ""}</p><p>{participation.status === "absent" ? "Sự kiện đã kết thúc và chưa có điểm danh cho đăng ký này." : "Nhắc lịch sẽ xuất hiện trong mục Thông báo từ 30 phút trước giờ bắt đầu. Bạn nhớ điểm danh khi tham dự."}</p>{message && <p role="status">{message}</p>}</section>;
  return <section className="event-participation-card"><h2>Tham gia sự kiện</h2>{!open ? <p>{!schedule ? "Ban tổ chức đang cập nhật đủ giờ bắt đầu và kết thúc để mở đăng ký." : "Đăng ký tham gia đã đóng vì sự kiện đã bắt đầu."}</p> : <form onSubmit={async (event) => { event.preventDefault(); if (pending) return; setPending(true); setMessage(""); try { const result = await onJoin(name, company); if (!result.persisted) setMessage("Đã đăng ký trên hệ thống nhưng thiết bị không lưu được mã theo dõi. Hãy giữ phiên ứng dụng này."); } catch (error) { setMessage(error instanceof Error ? error.message : "Chưa đăng ký được. Vui lòng thử lại."); } finally { setPending(false); } }}><p>Đăng ký để nhận nhắc lịch và theo dõi tham dự.</p><label>Họ và tên<input required maxLength={150} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập họ và tên" /></label><label>Doanh nghiệp / đơn vị<input maxLength={250} autoComplete="organization" value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Đơn vị (nếu có)" /></label>{message && <p className="form-status" role="alert">{message}</p>}<button className="primary-button" type="submit" disabled={pending || !name.trim()}>{pending ? "Đang đăng ký…" : "Tham gia"}</button><small>Thông tin được gửi tới Ban tổ chức. Chưa điểm danh khi kết thúc sẽ được ghi nhận vắng mặt.</small></form>}</section>;
}
