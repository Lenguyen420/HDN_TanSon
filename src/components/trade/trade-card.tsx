import { useState } from "react";
import { tradeImage, tradeRequest } from "@/services/trade";
import {
  tradePrice,
  tradeStatusLabels,
  tradeCategoryLabel,
  type TradePost,
} from "@/services/trade-types";
import { useTradeAction } from "./use-trade";
import TradeIcon from "./trade-icon";
export default function TradeCard({
  post,
  onOpen,
  managed = false,
}: {
  post: TradePost;
  onOpen: () => void;
  managed?: boolean;
}) {
  const [saved, setSaved] = useState(Boolean(post.saved)),
    task = useTradeAction();
  async function save() {
    await task.run(async () => {
      await tradeRequest(
        "trade-posts/" + post.id + "/save",
        saved ? "DELETE" : "POST",
        saved ? undefined : {},
        true,
      );
      setSaved(!saved);
    });
  }
  return (
    <article className="surface-card trade-post">
      <button
        className="trade-post-photo"
        onClick={onOpen}
        aria-label={"Xem " + post.title}
      >
        {post.thumbnailUrl ? (
          <img src={tradeImage(post.thumbnailUrl)} alt="" loading="lazy" />
        ) : (
          <span className="trade-photo-empty">Tân Sơn</span>
        )}
        {!!post.promotionPercent && (
          <span className="trade-discount">-{post.promotionPercent}%</span>
        )}
      </button>
      <div className="trade-post-copy">
        <div className="trade-card-top">
          <span className="trade-eyebrow">
            {post.categoryName || tradeCategoryLabel(post.category)}
          </span>
          {!managed && (
            <div className="trade-card-tools">
              <button
                onClick={() => void save()}
                disabled={task.busy}
                aria-label={saved ? "Bỏ lưu tin" : "Lưu tin"}
                aria-pressed={saved}
              >
                <TradeIcon name="bookmark" />
              </button>
              <a
                href={"tel:" + post.contactPhone}
                aria-label={"Gọi " + post.contactName}
                onClick={() =>
                  void tradeRequest(
                    "trade-posts/" + post.id + "/interactions",
                    "POST",
                    { type: "CONTACT_PHONE" },
                  ).catch(() => {})
                }
              >
                <TradeIcon name="phone" />
              </a>
            </div>
          )}
        </div>
        <button className="trade-post-open" onClick={onOpen}>
          <strong>{post.title}</strong>
        </button>
        <p className="trade-poster">
          {post.owner?.displayName ||
            post.contactName ||
            "Doanh nghiệp hội viên"}
        </p>
        {managed ? (
          <small>{tradeStatusLabels[post.status]}</small>
        ) : (
          <p className="trade-card-rating">
            <span className="trade-stars">★</span>{" "}
            <b>{post.averageRating.toFixed(1)}</b>{" "}
            <small>
              ({post.reviewCount} đánh giá) · {post.viewCount} lượt xem
            </small>
          </p>
        )}
        <p className="trade-card-summary">{post.summary}</p>
        <div className="trade-card-bottom">
          <small title={post.address}>{post.address}</small>
          <span className="trade-price">{tradePrice(post)}</span>
        </div>
        {post.featured && <small className="trade-badge">Hội giới thiệu</small>}
        {task.error && <p role="alert">{task.error}</p>}
      </div>
    </article>
  );
}
