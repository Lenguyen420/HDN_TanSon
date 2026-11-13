import { useEffect, useState, type FormEvent } from "react";
import { tradeRequest, tradeImage } from "@/services/trade";
import type {
  TradeActor,
  TradeReview,
  TradeImage,
} from "@/services/trade-types";
import { useTradeAction, useTradeList } from "./use-trade";
import TradeImages from "./trade-images";
function Composer({
  postId,
  own,
  disabledReason,
  onDone,
}: {
  postId: string;
  own?: TradeReview;
  disabledReason?: string;
  onDone: () => void;
}) {
  const [images, setImages] = useState<TradeImage[]>(own?.images || []),
    [imagesBusy, setImagesBusy] = useState(false),
    [rating, setRating] = useState(own?.rating || 0),
    task = useTradeAction();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await task.run(async () => {
      await tradeRequest(
        own ? "reviews/" + own.id : "trade-posts/" + postId + "/reviews",
        own ? "PATCH" : "POST",
        {
          rating: Number(data.get("rating")),
          content: String(data.get("content") || ""),
          imageIds: images.map((i) => i.id),
        },
        true,
      );
      onDone();
    });
  }
  return (
    <form className="trade-form" onSubmit={submit}>
      <h4>{own ? "Đánh giá của bạn" : "Chọn số sao đánh giá"}</h4>
      {own?.status === "HIDDEN" && (
        <p>
          Đánh giá đang được Hội ẩn. Chỉnh sửa sẽ giữ nguyên trạng thái này.
        </p>
      )}
      {disabledReason && <p role="status">{disabledReason}</p>}
      <fieldset className="trade-rating-picker" disabled={task.busy}>
        <legend>Chọn số sao</legend>
        <div className="trade-rating-choices">
          {[1, 2, 3, 4, 5].map((value) => (
            <label key={value} className="trade-rating-choice">
              <input
                type="radio"
                name="rating"
                value={value}
                checked={rating === value}
                onChange={() => setRating(value)}
                required
                aria-label={value + " sao"}
              />
              <span
                aria-hidden="true"
                className={value <= rating ? "is-selected" : ""}
              >
                ★
              </span>
            </label>
          ))}
        </div>
        <p className="trade-rating-selection" role="status">
          {rating
            ? rating + "/5 sao"
            : "Chạm vào ngôi sao để chọn mức đánh giá"}
        </p>
      </fieldset>
      <label>
        Nội dung
        <textarea
          name="content"
          disabled={Boolean(disabledReason)}
          required
          maxLength={500}
          defaultValue={own?.content || ""}
          placeholder="Chia sẻ trung thực về thông tin hoặc trải nghiệm hợp tác."
        />
      </label>
      {!disabledReason && (
        <TradeImages
          value={images}
          onChange={setImages}
          onBusyChange={setImagesBusy}
          max={3}
        />
      )}
      {task.error && <p role="alert">{task.error}</p>}
      <div className="trade-actions">
        <button
          className="primary-button"
          disabled={task.busy || imagesBusy || Boolean(disabledReason)}
        >
          {own ? "Cập nhật đánh giá" : "Gửi đánh giá"}
        </button>
        {own && (
          <button
            type="button"
            disabled={task.busy}
            onClick={() => {
              if (confirm("Xóa đánh giá của bạn?"))
                void task.run(async () => {
                  await tradeRequest(
                    "reviews/" + own.id,
                    "DELETE",
                    undefined,
                    true,
                  );
                  onDone();
                });
            }}
          >
            Xóa đánh giá
          </button>
        )}
      </div>
    </form>
  );
}
export default function TradeReviews({
  postId,
  actor,
  ownerId,
  onLogin,
  onUpdated,
}: {
  postId: string;
  actor: TradeActor | null;
  ownerId: string;
  onLogin: () => Promise<TradeActor>;
  onUpdated?: () => void;
}) {
  const [composing, setComposing] = useState(false);
  const [page, setPage] = useState(1),
    [own, setOwn] = useState<TradeReview>(),
    [revision, setRevision] = useState(0),
    [summary, setSummary] = useState<{
      count: number;
      averageRating: number;
      counts: Record<string, number>;
    } | null>(null),
    task = useTradeAction();
  const list = useTradeList<TradeReview>(
    "trade-posts/" + postId + "/reviews?page=" + page + "&limit=20",
  );
  useEffect(() => {
    let cancelled = false;
    void tradeRequest<{
      count: number;
      averageRating: number;
      counts: Record<string, number>;
    }>("trade-posts/" + postId + "/reviews/summary")
      .then((result) => {
        if (!cancelled) setSummary(result.data);
      })
      .catch(() => {});
    if (actor)
      void tradeRequest<TradeReview[]>(
        "reviews/me?tradePostId=" + postId,
        "GET",
        undefined,
        true,
      )
        .then((result) => {
          if (!cancelled) setOwn(result.data[0]);
        })
        .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [postId, actor?.id, revision]);
  const refresh = () => {
    list.refresh();
    setRevision((v) => v + 1);
  };
  async function reply(
    event: FormEvent<HTMLFormElement>,
    review: TradeReview,
    owner: boolean,
  ) {
    event.preventDefault();
    const form = event.currentTarget,
      content = String(new FormData(form).get("content") || "");
    await task.run(async () => {
      await tradeRequest(
        owner
          ? "trade-management/reviews/" + review.id + "/reply"
          : "trade-posts/" + postId + "/reviews/" + review.id + "/replies",
        owner ? "PUT" : "POST",
        { content },
        true,
      );
      form.reset();
      refresh();
    });
  }
  return (
    <article className="surface-card">
      <div className="trade-review-heading">
        <h3>Đánh giá giao thương</h3>
        <button
          type="button"
          aria-expanded={composing}
          onClick={() => setComposing((v) => !v)}
        >
          {composing ? "Đóng" : "Đánh giá"}
        </button>
      </div>
      {composing &&
        (actor ? (
          <Composer
            key={(own?.id || "new") + revision}
            postId={postId}
            own={own}
            disabledReason={
              actor.id === ownerId
                ? "Bạn là người đăng tin nên không thể tự gửi đánh giá. Chỉ người dùng khác mới có thể đánh giá tin này."
                : undefined
            }
            onDone={() => {
              refresh();
              setComposing(false);
              onUpdated?.();
            }}
          />
        ) : (
          <button
            disabled={task.busy}
            onClick={() =>
              void task.run(async () => {
                await onLogin();
              })
            }
          >
            Xác thực hồ sơ để đánh giá
          </button>
        ))}
      {summary && (
        <>
          <div className="trade-rating-overview">
            <div className="trade-rating-score">
              <strong>{summary.averageRating.toFixed(1)}</strong>
              <span
                className="trade-stars"
                aria-label={summary.averageRating + " trên 5 sao"}
              >
                {"★".repeat(Math.round(summary.averageRating))}
                <span className="trade-star-empty">
                  {"★".repeat(5 - Math.round(summary.averageRating))}
                </span>
              </span>
              <small>{summary.count} đánh giá</small>
            </div>
            <div className="trade-rating-bars">
              {[5, 4, 3, 2, 1].map((r) => (
                <p key={r}>
                  <span>
                    {r} <span className="trade-stars">★</span>
                  </span>
                  <progress
                    max={summary.count || 1}
                    value={summary.counts[r] || 0}
                  />
                  <small>
                    {summary.count
                      ? Math.round(
                          ((summary.counts[r] || 0) / summary.count) * 100,
                        )
                      : 0}
                    %
                  </small>
                </p>
              ))}
            </div>
          </div>
        </>
      )}
      {(task.error || list.error) && (
        <p role="alert">{task.error || list.error}</p>
      )}
      {list.loading ? (
        <p>Đang tải đánh giá…</p>
      ) : list.data.length ? (
        list.data.map((review) => (
          <section className="trade-review" key={review.id}>
            <div className="trade-review-person">
              <span className="trade-avatar">
                {review.user?.avatarUrl ? (
                  <img src={tradeImage(review.user.avatarUrl)} alt="" />
                ) : (
                  (review.user?.displayName || "H").charAt(0)
                )}
              </span>
              <div>
                <strong>{review.user?.displayName || "Người quan tâm"}</strong>
                <p
                  className="trade-stars"
                  aria-label={review.rating + " trên 5 sao"}
                >
                  {"★".repeat(review.rating)}
                  <span className="trade-star-empty">
                    {"★".repeat(5 - review.rating)}
                  </span>
                </p>
              </div>
              <time>
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </time>
            </div>
            <p>{review.content}</p>
            <div className="trade-gallery">
              {review.images.map((i) => (
                <img
                  key={i.id}
                  src={tradeImage(i.url)}
                  alt="Ảnh đánh giá"
                  loading="lazy"
                />
              ))}
            </div>
            {review.replyContent && (
              <blockquote>
                <strong>Doanh nghiệp phản hồi</strong>
                <p>{review.replyContent}</p>
              </blockquote>
            )}
            {review.replies?.map((r) => (
              <blockquote key={r.id}>{r.content}</blockquote>
            ))}
            {actor?.id === ownerId ? (
              <>
                <form
                  onSubmit={(e) => void reply(e, review, true)}
                  className="trade-form"
                >
                  <label>
                    Phản hồi của doanh nghiệp
                    <textarea
                      name="content"
                      required
                      maxLength={500}
                      defaultValue={review.replyContent || ""}
                    />
                  </label>
                  <button disabled={task.busy}>Gửi phản hồi</button>
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
                        refresh();
                      })
                    }
                  >
                    Xóa phản hồi
                  </button>
                )}
              </>
            ) : (
              actor &&
              review.replyContent && (
                <form
                  onSubmit={(e) => void reply(e, review, false)}
                  className="trade-form"
                >
                  <label>
                    Trao đổi thêm
                    <textarea name="content" maxLength={500} required />
                  </label>
                  <button disabled={task.busy}>Trả lời doanh nghiệp</button>
                </form>
              )
            )}
          </section>
        ))
      ) : (
        <p>Chưa có đánh giá. Hãy chia sẻ trải nghiệm kết nối đầu tiên.</p>
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
    </article>
  );
}
