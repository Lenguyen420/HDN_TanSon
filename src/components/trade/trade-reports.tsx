import { useEffect, useState, type FormEvent } from "react";
import { tradeRequest } from "@/services/trade";
import {
  tradeQuery,
  type TradeAnalytics,
  type TradeReview,
} from "@/services/trade-types";
import { useTradeList, useTradeAction } from "./use-trade";
export function TradeReports() {
  const [data, setData] = useState<TradeAnalytics | null>(null),
    [error, setError] = useState(""),
    [from, setFrom] = useState(""),
    [to, setTo] = useState("");
  useEffect(() => {
    let cancelled = false;
    void tradeRequest<TradeAnalytics>(
      "trade-posts/me/analytics" +
        tradeQuery({
          from: from ? new Date(from + "T00:00:00").toISOString() : undefined,
          to: to ? new Date(to + "T23:59:59").toISOString() : undefined,
        }),
      "GET",
      undefined,
      true,
    )
      .then((result) => {
        if (!cancelled) {
          setData(result.data);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Không tải được thống kê.");
      });
    return () => {
      cancelled = true;
    };
  }, [from, to]);
  return (
    <section>
      <div className="trade-form-grid">
        <label>
          Từ ngày
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label>
          Đến ngày
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>
      {error && <p role="alert">{error}</p>}
      {data ? (
        <>
          <div className="trade-stats">
            {[
              ["Tin của doanh nghiệp", data.postCount],
              ["Lượt xem", data.totals.views],
              ["Người xem", data.totals.uniqueVisitors],
              ["Liên hệ điện thoại", data.totals.contactPhone],
              ["Liên hệ Zalo", data.totals.contactZalo],
              ["Lượt lưu", data.totals.save],
              ["Chia sẻ", data.totals.share],
              ["Điểm đánh giá", data.reviews.averageRating],
            ].map(([label, value]) => (
              <article className="surface-card" key={label}>
                <small>{label}</small>
                <strong>{value}</strong>
              </article>
            ))}
          </div>
          <article className="surface-card">
            <h3>Cơ hội được quan tâm</h3>
            {data.topPosts.length ? (
              data.topPosts.map((row) => (
                <p key={row.id}>
                  {row.title} · {row.views} lượt xem
                </p>
              ))
            ) : (
              <p>Chưa có số liệu trong khoảng thời gian này.</p>
            )}
          </article>
          <article className="surface-card">
            <h3>Hoạt động theo ngày</h3>
            {data.timeseries.map((day) => (
              <p key={day.date}>
                {day.date}: {day.views} lượt xem,{" "}
                {day.contactPhone + day.contactZalo} lượt liên hệ, {day.save}{" "}
                lượt lưu.
              </p>
            ))}
          </article>
        </>
      ) : (
        <p>Đang tổng hợp hiệu quả kết nối…</p>
      )}
    </section>
  );
}
export function TradeSellerReviews() {
  const [page, setPage] = useState(1),
    list = useTradeList<TradeReview>(
      "trade-management/reviews?page=" + page + "&limit=20",
      true,
    ),
    task = useTradeAction();
  async function reply(event: FormEvent<HTMLFormElement>, review: TradeReview) {
    event.preventDefault();
    const content = String(
      new FormData(event.currentTarget).get("content") || "",
    );
    await task.run(async () => {
      await tradeRequest(
        "trade-management/reviews/" + review.id + "/reply",
        "PUT",
        { content },
        true,
      );
      list.refresh();
    });
  }
  return (
    <section>
      <h2>Đánh giá về tin của doanh nghiệp</h2>
      {(list.error || task.error) && (
        <p role="alert">{list.error || task.error}</p>
      )}
      {list.loading ? (
        <p>Đang tải đánh giá…</p>
      ) : !list.data.length ? (
        <article className="surface-card">
          Chưa có đánh giá về tin của doanh nghiệp.
        </article>
      ) : (
        list.data.map((review) => (
          <article key={review.id} className="surface-card">
            <h3>{review.post?.title}</h3>
            <p>
              {review.user?.displayName} · {review.rating}/5
            </p>
            <p>{review.content}</p>
            {review.replyContent && (
              <blockquote>{review.replyContent}</blockquote>
            )}
            {review.status === "PUBLISHED" ? (
              <>
                <form
                  onSubmit={(event) => void reply(event, review)}
                  className="trade-form"
                >
                  <label>
                    Phản hồi đến người quan tâm
                    <textarea
                      name="content"
                      required
                      maxLength={500}
                      defaultValue={review.replyContent || ""}
                    />
                  </label>
                  <button disabled={task.busy}>Lưu phản hồi</button>
                </form>
                {review.replyContent && (
                  <button
                    disabled={task.busy}
                    onClick={() =>
                      void task.run(async () => {
                        await tradeRequest(
                          "trade-management/reviews/" + review.id + "/reply",
                          "DELETE",
                          undefined,
                          true,
                        );
                        list.refresh();
                      })
                    }
                  >
                    Xóa phản hồi
                  </button>
                )}
              </>
            ) : (
              <p>Đánh giá đang ẩn, chưa thể phản hồi.</p>
            )}
          </article>
        ))
      )}
      <div className="trade-actions">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </button>
        <button
          disabled={page >= (list.meta?.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>
    </section>
  );
}
