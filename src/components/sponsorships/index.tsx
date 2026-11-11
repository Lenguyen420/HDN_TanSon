import { useState } from "react";
import UtilityLayout from "@/components/shared/utility-layout";
import FilterChips from "@/components/shared/filter-chips";
import { formatDate, formatMoney } from "@/components/shared/format";
import type { UtilityPageProps } from "@/components/shared/page-props";
import AppIcon from "@/components/icons";

export default function Sponsorships({ data, onBack }: UtilityPageProps) {
  const [kind, setKind] = useState("all");
  const records = data.utilityPages.sponsorships;
  const visible = records.filter((record) => kind === "all" || record.kind === kind);
  return (
    <UtilityLayout data={data} id="sponsorships" subtitle="Trân trọng từng đóng góp của Quý doanh nghiệp" onBack={onBack}>
      <section className="summary-banner sponsorship-summary"><span>TỔNG GIÁ TRỊ ĐỒNG HÀNH</span><strong>{formatMoney(records.reduce((total, record) => total + record.amount, 0))}</strong><p>{records.length} chương trình · Bao gồm giá trị hiện vật quy đổi</p><AppIcon name="handshake" /></section>
      <h2 className="utility-section-title">Dấu ấn đồng hành</h2>
      <FilterChips label="Hình thức tài trợ" value={kind} onChange={setKind} options={[{ value: "all", label: "Tất cả" }, { value: "cash", label: "Tiền mặt" }, { value: "in-kind", label: "Hiện vật" }]} />
      <div className="record-list">{visible.map((record) => <article className="surface-card history-record" key={record.id}><div className="record-title"><span className="record-icon warm"><AppIcon name="handshake" /></span><div><h3>{record.title}</h3><span className="record-reference">{record.kind === "cash" ? "Tài trợ tiền mặt" : "Tài trợ hiện vật"}</span></div></div><p className="record-description">{record.description}</p><div className="record-amount"><strong>{formatMoney(record.amount)}</strong><span className="status-pill success">{record.status}</span></div><div className="record-footer"><span>Ngày ghi nhận</span><time dateTime={record.date}>{formatDate(record.date)}</time></div></article>)}</div>
      {visible.length === 0 && <p className="surface-card empty-state">Chưa có tài trợ phù hợp.</p>}
    </UtilityLayout>
  );
}
