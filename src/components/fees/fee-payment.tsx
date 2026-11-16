import { useState, type FormEvent } from "react";
import { formatDate, formatMoney } from "@/components/shared/format";
import {
  feeStatusLabels,
  type FeeDue,
  type FeeProof,
} from "@/services/membership-fees";
export default function FeePayment({
  due,
  busy,
  onSubmit,
}: {
  due: FeeDue;
  busy: boolean;
  onSubmit: (proof: FeeProof) => Promise<void>;
}) {
  const [transactionRef, setRef] = useState(""),
    [proofUrl, setUrl] = useState(""),
    [note, setNote] = useState("");
  const canPay =
    ["unpaid", "overdue"].includes(due.status) &&
    due.campaign.status === "published";
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!busy)
      void onSubmit({
        transactionRef: transactionRef.trim(),
        proofUrl: proofUrl.trim(),
        note: note.trim(),
      });
  }
  return (
    <section className="fee-panel">
      <h2>{due.campaign.title}</h2>
      <span className={"fee-live-status " + due.status}>
        {feeStatusLabels[due.status]}
      </span>
      <div className="fee-payment-detail">
        <strong className="fee-payment-amount">
          {formatMoney(due.amountDue)}
        </strong>
        <dl>
          <div>
            <dt>Năm hội phí</dt>
            <dd>{due.campaign.year}</dd>
          </div>
          <div>
            <dt>Hạn đóng</dt>
            <dd>{formatDate(due.campaign.dueDate)}</dd>
          </div>
          <div>
            <dt>Mã khoản phí</dt>
            <dd className="fee-break">{due.id}</dd>
          </div>
        </dl>
        {due.campaign.description && (
          <p className="fee-live-description">{due.campaign.description}</p>
        )}
        {canPay && (
          <>
            <h3>Hướng dẫn chuyển khoản</h3>
            <p className="fee-payment-note fee-live-description">
              {due.campaign.paymentInstructions ||
                "Vui lòng liên hệ Ban thư ký Hội để nhận thông tin tài khoản chính thức trước khi chuyển khoản."}
            </p>
            <p className="fee-payment-note">
              Chuyển đúng số tiền và nội dung theo hướng dẫn. Gửi thông tin sau
              khi chuyển khoản; hội phí chỉ được ghi nhận đã đóng khi Ban thư ký
              xác nhận.
            </p>
            <form className="fee-proof-form" onSubmit={submit}>
              <fieldset disabled={busy}>
                <label>
                  Mã giao dịch *
                  <input
                    required
                    maxLength={150}
                    value={transactionRef}
                    onChange={(e) => setRef(e.target.value)}
                    placeholder="Mã giao dịch trên biên lai"
                  />
                </label>
                <label>
                  Đường dẫn minh chứng (HTTPS)
                  <input
                    type="url"
                    pattern="https://.*"
                    maxLength={2048}
                    value={proofUrl}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                  />
                </label>
                <label>
                  Ghi chú
                  <textarea
                    maxLength={2000}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    rows={3}
                    placeholder="Ngày chuyển, tên người chuyển…"
                  />
                </label>
              </fieldset>
              <button
                className="primary-button"
                disabled={busy || !transactionRef.trim()}
              >
                {busy ? "Đang gửi…" : "Đã chuyển khoản / Gửi minh chứng"}
              </button>
            </form>
          </>
        )}
        {due.status === "pending_confirmation" && (
          <p className="fee-live-notice">
            Đã gửi thông tin thanh toán, đang chờ Ban thư ký đối soát.
          </p>
        )}
        {due.status === "paid" && (
          <p className="fee-live-notice">
            Đã xác nhận đủ {formatMoney(due.amountDue)}
            {due.paidAt
              ? " ngày " + new Date(due.paidAt).toLocaleDateString("vi-VN")
              : ""}
            . Mã giao dịch: {due.transactionRef}
          </p>
        )}
        {due.status === "cancelled" && (
          <p className="fee-payment-note">Khoản phải đóng này đã được hủy.</p>
        )}
      </div>
    </section>
  );
}
