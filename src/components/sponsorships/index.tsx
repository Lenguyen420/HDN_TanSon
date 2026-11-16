import PageToolbar from "@/components/shared/page-toolbar";
import ContentCategories from "@/components/shared/content-categories";
import ContentListItem from "@/components/shared/content-list-item";
import { formatMoney, formatDate } from "@/components/shared/format";
import type { UtilityPageProps } from "@/components/shared/page-props";
import "./partners.scss";
export default function Sponsorships({
  onBack,
  partners,
  onOpenPartner,
}: UtilityPageProps) {
  if (!partners) return null;
  const c = partners;
  return (
    <main className="partners-page">
      <PageToolbar title="Đơn vị đồng hành" onBack={onBack} sticky />
      <ContentCategories
        value={c.sort}
        onChange={c.setSort}
        items={[
          { id: "amount", title: "Tiền lũy kế" },
          { id: "updated", title: "Cập nhật mới" },
          { id: "name", title: "Tên đơn vị" },
        ]}
      />
      <div className="partners-body">
        <section className="partner-summary">
          <span>TRÂN TRỌNG SỰ ĐỒNG HÀNH</span>
          <strong>
            {c.summary ? formatMoney(c.summary.totalAmount) : "—"}
          </strong>
          <p>
            {c.summary?.totalPartners ?? "—"} đơn vị ·{" "}
            {c.summary?.contributionCount ?? "—"} lượt tài trợ công khai
          </p>
          <small>Tổng tiền tài trợ, hiện vật được ghi nhận riêng.</small>
        </section>
        <label className="partner-search">
          <span>Tìm đơn vị đồng hành</span>
          <input
            type="search"
            placeholder="Nhập tên công ty, đơn vị…"
            maxLength={150}
            value={c.search}
            onChange={(e) => c.setSearch(e.target.value)}
          />
        </label>
        {c.loading && (
          <p className="partner-status" role="status">
            Đang tải đơn vị đồng hành…
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
        {!c.loading && !c.error && !c.rows.length && (
          <div className="surface-card empty-state">
            Chưa có đơn vị đồng hành phù hợp.
          </div>
        )}
        {!c.error && (
          <section
            className="partner-list"
            aria-label="Danh sách đơn vị đồng hành"
          >
            {c.rows.map((p) => (
              <article key={p.id} className="surface-card partner-list-card">
                <ContentListItem
                  categoryTitle="Đơn vị đồng hành"
                  article={{
                    id: p.id,
                    title: p.name,
                    image: p.logo,
                    topic: p.industry || "Đơn vị đồng hành",
                    publishedAt: p.updatedAt?.slice(0, 10) || "",
                    summary: `${formatMoney(p.totalAmount)} · ${p.contributionCount} lượt đóng góp · Xem chi tiết`,
                    paragraphs: [],
                  }}
                  onSelect={() => onOpenPartner?.(p.id)}
                />
                <div className="partner-recent">
                  <h3>Đã đóng góp</h3>
                  {p.latestContributions?.length ? (
                    <ul>
                      {p.latestContributions.map((item) => (
                        <li key={item.id}>
                          <strong>{item.title}</strong>
                          <span>
                            {item.type === "money"
                              ? formatMoney(item.amount || 0)
                              : `${item.itemName} · Số lượng: ${item.quantity}`}
                          </span>
                          <small>{formatDate(item.contributionDate)}</small>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>
                      {p.contributionCount
                        ? "Mở lịch sử để xem các khoản đóng góp."
                        : "Chưa có khoản đóng góp công khai."}
                    </p>
                  )}
                  <button
                    className="primary-button"
                    onClick={() => onOpenPartner?.(p.id)}
                  >
                    Xem lịch sử đóng góp ({p.contributionCount}) →
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
        {c.total > 20 && !c.error && (
          <div className="partner-pagination">
            <button
              disabled={c.loading || c.page <= 1}
              onClick={() => c.setPage((n) => n - 1)}
            >
              Trước
            </button>
            <span>Trang {c.page}</span>
            <button
              disabled={c.loading || c.page * 20 >= c.total}
              onClick={() => c.setPage((n) => n + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
