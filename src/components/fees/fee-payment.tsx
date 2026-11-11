import type { FeeRecord } from "@/datas/types";
import { formatDate, formatMoney } from "@/components/shared/format";

interface FeePaymentProps { records: FeeRecord[]; selectedId: string; onSelect: (id: string) => void; }
export default function FeePayment({ records, selectedId, onSelect }: FeePaymentProps) {
  const pending = records.filter((record) => record.status === "pending");
  const selected = pending.find((record) => record.id === selectedId);
  return (
    <div className="fee-payment-panels">
      <section className="fee-panel"><h2>Khoản cần đóng</h2>
        {pending.length === 0 ? <p className="fee-empty-message">Bạn chưa có công nợ hội phí cần thanh toán.</p> : (
          <fieldset className="fee-due-list"><legend className="sr-only">Chọn khoản hội phí cần đóng</legend>{pending.map((record) => <label key={record.id} className={`fee-due-option ${selectedId === record.id ? "is-selected" : ""}`}><input type="radio" name="fee-payment" value={record.id} checked={selectedId === record.id} onChange={() => onSelect(record.id)} /><span><strong>{record.title}</strong><small>{record.reference} · {formatDate(record.date)}</small></span><b>{formatMoney(record.amount)}</b></label>)}</fieldset>
        )}
      </section>
      <section className="fee-panel"><h2>Thanh toán hội phí</h2>
        {!selected ? <p className="fee-empty-message">Chọn khoản hội phí để xem số tiền cần đóng.</p> : <div className="fee-payment-detail"><span className="overline">SỐ TIỀN CẦN ĐÓNG</span><strong className="fee-payment-amount">{formatMoney(selected.amount)}</strong><dl><div><dt>Khoản hội phí</dt><dd>{selected.title}</dd></div><div><dt>Mã tham chiếu</dt><dd>{selected.reference}</dd></div></dl><p className="fee-payment-note">Thông tin tài khoản và cổng thanh toán chính thức chưa được kết nối. Vui lòng chờ hướng dẫn từ Ban thư ký Hội.</p><button type="button" className="primary-button" disabled>Chưa hỗ trợ thanh toán trực tuyến</button></div>}
      </section>
    </div>
  );
}
