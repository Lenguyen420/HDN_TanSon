import { formatMoney } from "@/components/shared/format";
import { feeStatusLabels, type FeePayment } from "@/services/membership-fees";
export default function FeeHistory({ payments }: { payments: FeePayment[] }) {
  return (
    <section className="fee-panel">
      <h2>Lịch sử thanh toán</h2>
      {!payments.length && (
        <p className="fee-empty-message">Chưa có thông tin thanh toán.</p>
      )}
      {payments.map((p) => (
        <article className="fee-live-history" key={p.id}>
          <strong>
            {feeStatusLabels[p.status]} · {formatMoney(p.amount)}
          </strong>
          <p>
            {p.method === "cash" ? "Tiền mặt" : "Chuyển khoản"} ·{" "}
            {new Date(p.createdAt).toLocaleString("vi-VN")}
          </p>
          <p className="fee-break">Mã giao dịch: {p.transactionRef}</p>
          {p.note && <p>{p.note}</p>}
          {p.proofUrl && (
            <a href={p.proofUrl} target="_blank" rel="noreferrer">
              Xem minh chứng đã gửi
            </a>
          )}
          {p.audit
            .filter((a) => a.note)
            .map((a, i) => (
              <p key={i}>{a.note}</p>
            ))}
        </article>
      ))}
    </section>
  );
}
