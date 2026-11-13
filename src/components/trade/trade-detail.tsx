import { useEffect, useRef, useState, type FormEvent } from "react";
import { tradeRequest, tradeImage, loginTrade } from "@/services/trade";
import {
  tradePrice,
  tradeStatusLabels,
  type TradeActor,
  type TradePost,
  type TradeConversation,
} from "@/services/trade-types";
import { useTradeAction } from "./use-trade";
import TradeReviews from "./trade-reviews";
import TradeComments from "./trade-comments";
import TradeIcon from "./trade-icon";
import { tradeCategoryLabel } from "@/services/trade-types";
export default function TradeDetail({
  id,
  actor,
  managed = false,
  onEdit,
  onConversation,
  focusCommentId,
  onNotices,
}: {
  id: string;
  focusCommentId?: string;
  onNotices?: () => void;
  actor: TradeActor | null;
  managed?: boolean;
  onEdit: (post: TradePost) => void;
  onConversation: (row: TradeConversation) => void;
}) {
  const [post, setPost] = useState<TradePost | null>(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    [shareMessage, setShareMessage] = useState(""),
    task = useTradeAction();
  const readVersion = useRef(0);
  useEffect(() => {
    let cancelled = false;
    const version = ++readVersion.current;
    void tradeRequest<TradePost>(
      "trade-posts/" + encodeURIComponent(id) + (managed ? "/manage" : ""),
      "GET",
      undefined,
      managed,
    )
      .then((result) => {
        if (!cancelled && version === readVersion.current) {
          setPost(result.data);
          setError("");
        }
      })
      .catch((e) => {
        if (!cancelled && version === readVersion.current)
          setError(e instanceof Error ? e.message : "Không đọc được tin.");
      });
    return () => {
      cancelled = true;
    };
  }, [id, managed, revision, actor?.id]);
  if (error)
    return (
      <div className="surface-card">
        <p role="alert">{error}</p>
        <button onClick={() => setRevision((r) => r + 1)}>Thử lại</button>
      </div>
    );
  if (!post) return <p role="status">Đang tải tin giao thương…</p>;
  const mine = actor?.id === post.ownerId;
  const interaction = (type: string) =>
    tradeRequest("trade-posts/" + post.id + "/interactions", "POST", {
      type,
    }).catch(() => {});
  async function save() {
    await task.run(async () => {
      const result = await tradeRequest<{ saveCount: number }>(
        "trade-posts/" + post!.id + "/save",
        post!.saved ? "DELETE" : "POST",
        post!.saved ? undefined : {},
        true,
      );
      readVersion.current++;
      setError("");
      setPost({
        ...post!,
        saved: !post!.saved,
        saveCount: post!.saved
          ? Math.max(0, post!.saveCount - 1)
          : result.data.saveCount,
      });
    });
  }
  async function share() {
    await task.run(async () => {
      const url = new URL(window.location.href);
      url.searchParams.set("tradePost", post!.slug);
      if (navigator.share)
        await navigator.share({
          title: post!.title,
          text: post!.summary,
          url: url.href,
        });
      else {
        await navigator.clipboard.writeText(url.href);
        setShareMessage("Đã sao chép liên kết tin.");
      }
      await interaction("SHARE");
    });
  }
  async function message(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget,
      content = String(new FormData(form).get("message") || "").trim();
    await task.run(async () => {
      const result = await tradeRequest<TradeConversation>(
        "trade-conversations",
        "POST",
        { tradePostId: post!.id, message: content },
        true,
      );
      onConversation(result.data);
    });
  }
  const zalo = post.contactZalo
    ? "https://zalo.me/" +
      encodeURIComponent(post.contactZalo.replace(/^https:\/\/zalo\.me\//, ""))
    : "";
  return (
    <section className="trade-detail-page">
      <div className="trade-hero">
        <span className="trade-hero-category">
          {post.categoryName || tradeCategoryLabel(post.category)}
        </span>
        {post.images.length ? (
          <div className="trade-hero-gallery">
            {post.images.map((image) => (
              <img
                key={image.id}
                src={tradeImage(image.url)}
                alt={post.title}
              />
            ))}
          </div>
        ) : (
          <div className="trade-hero-placeholder">
            Kết nối doanh nghiệp Tân Sơn
          </div>
        )}
        {!!post.promotionPercent && (
          <span className="trade-discount">-{post.promotionPercent}%</span>
        )}
      </div>
      <article className="surface-card trade-detail">
        <span
          className={
            "trade-eyebrow " +
            (post.status === "PUBLISHED" ? "trade-active" : "")
          }
        >
          {post.status === "PUBLISHED"
            ? "Tin đang hoạt động"
            : tradeStatusLabels[post.status]}
        </span>
        <h2>{post.title}</h2>
        <p className="trade-price">{tradePrice(post)}</p>
        <p className="trade-card-rating">
          <span className="trade-stars">★</span>{" "}
          <b>{post.averageRating.toFixed(1)}</b>{" "}
          <span className="trade-muted">{post.reviewCount} lượt đánh giá</span>
        </p>
        <div className="trade-detail-meta">
          <span>
            <TradeIcon name="pin" />
            {post.address}
          </span>
          <span>
            <TradeIcon name="clock" />
            Đăng{" "}
            {new Date(post.publishedAt || post.createdAt).toLocaleDateString(
              "vi-VN",
            )}
          </span>
          <span>
            <TradeIcon name="eye" />
            {post.viewCount} lượt xem
          </span>
          <span>
            <TradeIcon name="bookmark" />
            {post.saveCount} người đã lưu
          </span>
          <span>
            {post.purpose === "NON_PROFIT"
              ? "Kết nối cộng đồng"
              : post.priceType === "FIXED"
                ? "Giá cố định"
                : post.priceType === "NEGOTIABLE"
                  ? "Giá thỏa thuận"
                  : "Liên hệ báo giá"}
          </span>
        </div>
        {post.featured && <p className="trade-badge">Hội giới thiệu</p>}
        {post.rejectedReason && (
          <p role="status">Hội đề nghị bổ sung: {post.rejectedReason}</p>
        )}
        <div className="trade-actions">
          {post.status === "PUBLISHED" && (
            <button disabled={task.busy} onClick={() => void share()}>
              <TradeIcon name="share" /> Chia sẻ
            </button>
          )}
          {mine && (
            <button
              disabled={["PENDING", "ARCHIVED"].includes(post.status)}
              onClick={() => onEdit(post)}
            >
              Sửa tin
            </button>
          )}
        </div>
        {shareMessage && <p role="status">{shareMessage}</p>}
      </article>
      {task.error && <p role="alert">{task.error}</p>}
      <article className="surface-card">
        <h3>Thông tin người đăng</h3>
        <div className="trade-seller">
          <span className="trade-avatar">
            {post.owner?.avatarUrl ? (
              <img src={tradeImage(post.owner.avatarUrl)} alt="" />
            ) : (
              (post.owner?.displayName || post.contactName).charAt(0)
            )}
          </span>
          <div>
            <strong>{post.owner?.displayName || post.contactName}</strong>
            <p className="trade-muted">Hội viên doanh nghiệp Tân Sơn</p>
          </div>
        </div>
        <dl className="trade-contact-info">
          <div>
            <dt>Người liên hệ</dt>
            <dd>{post.contactName}</dd>
          </div>
          <div>
            <dt>Điện thoại</dt>
            <dd>
              <a
                href={"tel:" + post.contactPhone}
                onClick={() => void interaction("CONTACT_PHONE")}
              >
                {post.contactPhone}
              </a>
            </dd>
          </div>
        </dl>
        {zalo && (
          <a
            href={zalo}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => void interaction("CONTACT_ZALO")}
          >
            Liên hệ qua Zalo
          </a>
        )}
      </article>
      <article className="surface-card">
        <h3>Nội dung chi tiết</h3>
        <p>
          <strong>{post.summary}</strong>
        </p>
        <div className="trade-description">{post.description}</div>
        {!!post.promotionPercent && (
          <p className="trade-promotion">
            Ưu đãi {post.promotionPercent}%
            {post.promotionStartAt && post.promotionEndAt
              ? " · " +
                new Date(post.promotionStartAt).toLocaleDateString("vi-VN") +
                " – " +
                new Date(post.promotionEndAt).toLocaleDateString("vi-VN")
              : ""}
          </p>
        )}
        {post.eventStartAt && (
          <p>
            Hoạt động: {new Date(post.eventStartAt).toLocaleString("vi-VN")}
            {post.eventEndAt
              ? " – " + new Date(post.eventEndAt).toLocaleString("vi-VN")
              : ""}
          </p>
        )}
        {post.expiresAt && (
          <small>
            Hiệu lực đến {new Date(post.expiresAt).toLocaleString("vi-VN")}
          </small>
        )}
      </article>
      <article className="surface-card">
        <h3>Khu vực giao dịch</h3>
        <div className="trade-location">
          <TradeIcon name="pin" size={30} />
          <div>
            <strong>{post.address}</strong>
            <p>Có thể thỏa thuận giao nhận trong khu vực.</p>
          </div>
        </div>
        {post.googleMapsUrl && (
          <a
            href={post.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem đường đi trên Google Maps
          </a>
        )}
      </article>
      {post.status === "PUBLISHED" && (
        <>
          <TradeReviews
            key={"reviews-" + (actor?.id || "guest")}
            postId={post.id}
            actor={actor}
            ownerId={post.ownerId}
            onLogin={() => loginTrade()}
            onUpdated={() => setRevision((r) => r + 1)}
          />
          <TradeComments
            key={"comments-" + post.id + (actor?.id || "guest")}
            postId={post.id}
            actor={actor}
            ownerId={post.ownerId}
            focusId={focusCommentId}
            onNotices={onNotices}
          />
          {!mine && (
            <article className="surface-card">
              <h3>Trao đổi riêng với doanh nghiệp</h3>
              <form className="trade-form" onSubmit={message}>
                <label>
                  Lời nhắn hợp tác
                  <textarea
                    name="message"
                    required
                    maxLength={1000}
                    placeholder="Thông tin muốn trao đổi riêng với doanh nghiệp."
                  />
                </label>
                <button className="primary-button" disabled={task.busy}>
                  Gửi lời nhắn riêng
                </button>
              </form>
            </article>
          )}
          <div className="trade-detail-footer">
            <button
              disabled={task.busy}
              onClick={() => void save()}
              aria-pressed={Boolean(post.saved)}
            >
              <TradeIcon name="bookmark" />
              {post.saved ? "Đã lưu" : "Lưu tin"}
            </button>
            <a
              href={"tel:" + post.contactPhone}
              onClick={() => void interaction("CONTACT_PHONE")}
            >
              <TradeIcon name="phone" size={24} />
              <span>
                Liên hệ ngay<small>{post.contactPhone}</small>
              </span>
            </a>
          </div>
        </>
      )}
    </section>
  );
}
