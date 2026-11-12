import { useState } from "react";
export default function CheckInForm({ initialName, initialCompany, onSubmit }: { initialName: string; initialCompany: string; onSubmit: (name: string, company: string) => Promise<{ persisted: boolean }> }) {
  const [name, setName] = useState(initialName);
  const [company, setCompany] = useState(initialCompany);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  return <form className="event-check-in-form" onSubmit={async (event) => { event.preventDefault(); if (pending) return; setPending(true); setError(""); try { const result = await onSubmit(name, company); if (!result.persisted) setError("Đã điểm danh trên hệ thống. Thiết bị không lưu được mã theo dõi; hãy giữ màn hình xác nhận."); } catch (error) { setError(error instanceof Error ? error.message : "Không thể điểm danh. Vui lòng thử lại."); } finally { setPending(false); } }}>
    <h2>Xác nhận tham dự</h2><p>Điền thông tin để Ban tổ chức ghi nhận bạn có mặt tại sự kiện.</p>
    <label>Họ và tên <span aria-hidden="true">*</span><input required autoComplete="name" maxLength={150} value={name} onChange={(event) => setName(event.target.value)} placeholder="Nhập họ và tên" /></label>
    <label>Doanh nghiệp / đơn vị<input autoComplete="organization" maxLength={250} value={company} onChange={(event) => setCompany(event.target.value)} placeholder="Nhập tên đơn vị (nếu có)" /></label>
    <p className="event-panel-caption">Tên và đơn vị được gửi đến Ban tổ chức cùng thời gian điểm danh. Đây là thông tin do bạn tự xác nhận.</p>
    {error && <p className="form-status" role="alert">{error}</p>}<button className="primary-button" type="submit" disabled={pending || !name.trim()}>{pending ? "Đang xác nhận…" : "Xác nhận điểm danh"}</button>
  </form>;
}
