import PageToolbar from "@/components/shared/page-toolbar";
import type { UtilityPageProps } from "@/components/shared/page-props";
import { formatDate, formatMoney } from "@/components/shared/format";
import { feeStatusLabels } from "@/services/membership-fees";
import FeePayment from "./fee-payment";
import FeeHistory from "./fee-history";
import "./fees.scss";
export default function Fees({ fees, onBack }: UtilityPageProps) {
  if (!fees) return null;
  const visible = fees.rows.filter((d) =>
    fees.tab === "history"
      ? ["paid", "cancelled"].includes(d.status)
      : !["paid", "cancelled"].includes(d.status),
  );
  return (
    <main className="fees-page fee-workspace">
      <PageToolbar
        title={fees.detail ? "Chi tiết hội phí" : "Hội phí của tôi"}
        onBack={() =>
          fees.busy ? undefined : fees.detail ? fees.back() : onBack()
        }
      />
      {!fees.detail && (
        <div
          className="fee-tab-bar"
          role="group"
          aria-label="Chức năng hội phí"
        >
          <button
            type="button"
            aria-pressed={fees.tab === "dues"}
            className={fees.tab === "dues" ? "is-active" : ""}
            onClick={() => fees.setTab("dues")}
          >
            Khoản cần đóng
          </button>
          <button
            type="button"
            aria-pressed={fees.tab === "history"}
            className={fees.tab === "history" ? "is-active" : ""}
            onClick={() => fees.setTab("history")}
          >
            Lịch sử
          </button>
        </div>
      )}
      <div className="fee-workspace-body">
        <div className="fee-live-toolbar">
          <p>Hội phí theo hồ sơ hội viên đã được duyệt</p>
          <button
            type="button"
            disabled={fees.loading || fees.busy}
            onClick={() => void fees.refresh()}
          >
            Làm mới
          </button>
        </div>
        {fees.error && (
          <div className="fee-live-error" role="alert">
            <p>{fees.error}</p>
            <button
              type="button"
              onClick={() => void fees.refresh()}
              disabled={fees.loading || fees.busy}
            >
              Thử lại
            </button>
          </div>
        )}
        {fees.notice && (
          <p className="fee-live-notice" role="status">
            {fees.notice}
          </p>
        )}
        {fees.loading ? (
          <p className="fee-empty-message" role="status">
            Đang tải hội phí…
          </p>
        ) : fees.detail ? (
          <FeePayment
            due={fees.detail}
            busy={fees.busy}
            onSubmit={fees.submit}
          />
        ) : (
          <>
            {fees.tab === "history" && (
              <div className="fee-history-total">
                <span>Tổng đã đóng</span>
                <strong>
                  {formatMoney(
                    fees.rows
                      .filter((d) => d.status === "paid")
                      .reduce((sum, d) => sum + d.amountDue, 0),
                  )}
                </strong>
              </div>
            )}
            {visible.map((d) => (
              <button
                key={d.id}
                type="button"
                className="fee-live-card"
                onClick={() => void fees.open(d.id)}
              >
                <span className="fee-live-card-top">
                  <strong>{d.campaign.title}</strong>
                  <span className={"fee-live-status " + d.status}>
                    {feeStatusLabels[d.status]}
                  </span>
                </span>
                <small>
                  Năm {d.campaign.year} · Hạn {formatDate(d.campaign.dueDate)}
                </small>
                <b>{formatMoney(d.amountDue)}</b>
                <span className="fee-live-link">Xem chi tiết →</span>
              </button>
            ))}
            {!visible.length && !fees.error && (
              <p className="fee-empty-message">
                {fees.tab === "history"
                  ? "Chưa có lịch sử đóng hội phí."
                  : "Bạn chưa có khoản hội phí cần đóng."}
              </p>
            )}
          </>
        )}
        {fees.detail && !fees.loading && (
          <FeeHistory payments={fees.detail.payments || []} />
        )}
      </div>
    </main>
  );
}
