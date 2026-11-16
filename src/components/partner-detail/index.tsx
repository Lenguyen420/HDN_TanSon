import { useEffect } from "react";
import PageToolbar from "@/components/shared/page-toolbar";
import ArticleImage from "@/components/shared/article-image";
import { formatMoney, formatDate } from "@/components/shared/format";
import type { PartnersController } from "@/components/sponsorships/use-partners";
import "@/components/sponsorships/partners.scss";
export interface PartnerDetailProps {
  partners: PartnersController;
  onBack: () => void;
  contributionId?: string;
}
export default function PartnerDetail({
  partners: c,
  onBack,
  contributionId,
}: PartnerDetailProps) {
  const p = c.detail;
  const history = p?.contributions || [];
  const items =
    p?.selectedContribution &&
    !history.some((item) => item.id === p.selectedContribution!.id)
      ? [p.selectedContribution, ...history]
      : history;
  useEffect(() => {
    if (p && contributionId)
      document
        .getElementById("contribution-" + contributionId)
        ?.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [p, contributionId]);
  return (
    <main className="partners-page">
      <PageToolbar title="Chi tiết đơn vị đồng hành" onBack={onBack} sticky />
      <div className="partners-body">
        {c.loading && (
          <p className="partner-status" role="status">
            Đang tải thông tin…
          </p>
        )}
        {c.error && (
          <div className="surface-card partner-status" role="alert">
            <p>{c.error}</p>
            <button className="primary-button" onClick={c.retry}>
              Thử lại
            </button>
          </div>
        )}
        {p && !c.error && (
          <>
            <section className="surface-card partner-profile">
              <ArticleImage
                src={p.logo}
                alt={p.name}
                className="partner-logo"
              />
              <h1>{p.name}</h1>
              {p.industry && (
                <span className="content-topic">{p.industry}</span>
              )}
            </section>
            <section className="partner-summary">
              <span>TÀI TRỢ BẰNG TIỀN LŨY KẾ</span>
              <strong>{formatMoney(p.totalAmount)}</strong>
              <p>{p.contributionCount} lượt đóng góp công khai</p>
            </section>
            <h2 className="utility-section-title">
              Đơn vị đã đóng góp những gì?
            </h2>
            {!p.contributions?.length && (
              <p className="surface-card empty-state">
                Chưa có khoản đóng góp công khai.
              </p>
            )}
            <section className="partner-history">
              {items.map((item) => (
                <article
                  id={"contribution-" + item.id}
                  key={item.id}
                  className={
                    "surface-card partner-contribution" +
                    (contributionId === item.id ? " is-highlighted" : "")
                  }
                >
                  <span className="content-topic">
                    {item.type === "in_kind"
                      ? "Tài trợ hiện vật"
                      : item.paymentMethod === "cash"
                        ? "Tài trợ tiền mặt"
                        : "Tài trợ chuyển khoản"}
                  </span>
                  <h3>{item.title}</h3>
                  <time dateTime={item.contributionDate}>
                    {formatDate(item.contributionDate)}
                  </time>
                  <strong>
                    {item.type === "money"
                      ? formatMoney(item.amount || 0)
                      : `${item.itemName} · Số lượng: ${item.quantity}`}
                  </strong>
                  {item.type === "in_kind" && item.estimatedValue !== null && (
                    <p>Giá trị ước tính: {formatMoney(item.estimatedValue)}</p>
                  )}
                  <p className="partner-prose">{item.description}</p>
                  <div className="partner-evidence">
                    {item.images.map((src) => (
                      <a href={src} key={src} target="_blank" rel="noreferrer">
                        <ArticleImage
                          src={src}
                          alt={"Ảnh công khai: " + item.title}
                        />
                      </a>
                    ))}
                  </div>
                </article>
              ))}
            </section>
            <details className="surface-card partner-profile">
              <summary>Thông tin về đơn vị</summary>
              <p className="partner-prose">{p.description}</p>
              {p.address && <p>Địa chỉ: {p.address}</p>}
              {p.website && (
                <a href={p.website} target="_blank" rel="noreferrer">
                  Website doanh nghiệp ↗
                </a>
              )}
            </details>
            {c.historyTotal > 20 && (
              <div className="partner-pagination">
                <button
                  disabled={c.loading || c.historyPage <= 1}
                  onClick={() => c.setHistoryPage((n) => n - 1)}
                >
                  Trước
                </button>
                <span>Trang {c.historyPage}</span>
                <button
                  disabled={c.loading || c.historyPage * 20 >= c.historyTotal}
                  onClick={() => c.setHistoryPage((n) => n + 1)}
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
