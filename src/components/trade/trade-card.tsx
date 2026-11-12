import { tradeImage } from "@/services/trade";
import {
  tradePrice,
  tradeStatusLabels,
  type TradePost,
} from "@/services/trade-types";
export default function TradeCard({
  post,
  onOpen,
  managed = false,
}: {
  post: TradePost;
  onOpen: () => void;
  managed?: boolean;
}) {
  return (
    <article className="surface-card trade-post">
      <button className="trade-post-open" onClick={onOpen}>
        {post.thumbnailUrl && (
          <img src={tradeImage(post.thumbnailUrl)} alt="" loading="lazy" />
        )}
        <span>
          {post.featured && (
            <small className="trade-badge">Hội giới thiệu</small>
          )}
          <strong>{post.title}</strong>
          <span className="trade-price">{tradePrice(post)}</span>
          <span>{post.summary}</span>
          <small>{post.address}</small>
          <small>
            {managed
              ? tradeStatusLabels[post.status]
              : (post.owner?.displayName || "Doanh nghiệp hội viên") +
                " · " +
                post.averageRating +
                "/5 (" +
                post.reviewCount +
                ")"}
          </small>
        </span>
      </button>
    </article>
  );
}
