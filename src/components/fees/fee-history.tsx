import { useState } from "react";
import type { FeeRecord } from "@/datas/types";
import { formatDate, formatMoney } from "@/components/shared/format";
import AppIcon from "@/components/icons";

export default function FeeHistory({ records }: { records: FeeRecord[] }) {
  const [year, setYear] = useState("all");
  const paid = records.filter((record) => record.status === "paid");
  const visible = paid.filter((record) => year === "all" || String(record.year) === year);
  return (
    <div className="fee-history-view">
      <div className="history-toolbar"><h2>Lịch sử đóng phí</h2><label className="year-select">Năm<select aria-label="Lọc năm hội phí" value={year} onChange={(event) => setYear(event.target.value)}><option value="all">Tất cả</option>{Array.from(new Set(paid.map((record) => record.year))).sort((a, b) => b - a).map((value) => <option value={value} key={value}>{value}</option>)}</select></label></div>
      <div className="fee-history-total"><span>Tổng đã đóng</span><strong>{formatMoney(visible.reduce((sum, record) => sum + record.amount, 0))}</strong></div>
      {visible.map((record) => <article className="surface-card history-record" key={record.id}><div className="record-title"><span className="record-icon"><AppIcon name="wallet" /></span><div><h3>{record.title}</h3><span className="record-reference">{record.reference}</span></div></div><div className="record-amount"><strong>{formatMoney(record.amount)}</strong><span className="status-pill success">Đã đóng</span></div><div className="record-footer"><span>Ngày ghi nhận</span><time dateTime={record.date}>{formatDate(record.date)}</time></div></article>)}
      {visible.length === 0 && <div className="history-empty-panel">Chưa có dữ liệu phù hợp.</div>}
    </div>
  );
}
