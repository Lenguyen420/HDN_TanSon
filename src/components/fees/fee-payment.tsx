import { prepareFeeProofImage } from "@/services/fee-proof-image";
import { useRef, useState, type FormEvent } from "react";
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
  const [proofImage, setProofImage] = useState(""),
    [note, setNote] = useState("");
  const [preparing, setPreparing] = useState(false),
    [imageError, setImageError] = useState("");
  const selection = useRef(0);
  async function selectImage(file?: File) {
    const current = ++selection.current;
    setProofImage("");
    setImageError("");
    if (!file) return;
    setPreparing(true);
    try {
      const image = await prepareFeeProofImage(file);
      if (selection.current === current) setProofImage(image);
    } catch (e) {
      if (selection.current === current)
        setImageError(e instanceof Error ? e.message : "Không đọc được ảnh.");
    } finally {
      if (selection.current === current) setPreparing(false);
    }
  }
  const canPay =
    ["unpaid", "overdue"].includes(due.status) &&
    due.campaign.status === "published";
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!busy && !preparing && proofImage)
      void onSubmit({
        proofImage,
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
              <fieldset disabled={busy || preparing}>
                <label>
                  Ảnh minh chứng thanh toán *
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      e.currentTarget.value = "";
                      void selectImage(file);
                    }}
                  />
                </label>
                <small>
                  Chọn ảnh JPG, PNG hoặc WebP từ thiết bị, tối đa 10 MB. Ảnh
                  được thu nhỏ trước khi gửi.
                </small>
                {preparing && <p role="status">Đang xử lý ảnh…</p>}
                {imageError && (
                  <p className="fee-live-error" role="alert">
                    {imageError}
                  </p>
                )}
                {proofImage && (
                  <div>
                    <img
                      className="fee-proof-preview"
                      src={proofImage}
                      alt="Ảnh minh chứng đã chọn"
                    />
                    <button type="button" onClick={() => setProofImage("")}>
                      Xóa ảnh
                    </button>
                  </div>
                )}
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
                disabled={busy || preparing || !proofImage}
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
            .
          </p>
        )}
        {due.status === "cancelled" && (
          <p className="fee-payment-note">Khoản phải đóng này đã được hủy.</p>
        )}
      </div>
    </section>
  );
}
