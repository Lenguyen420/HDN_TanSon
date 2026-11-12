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
export default function TradeDetail({
  id,
  actor,
  managed = false,
  onEdit,
  onConversation,
}: {
  id: string;
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
    <section>
      <article className="surface-card trade-detail">
        {managed && (
          <p className="trade-badge">{tradeStatusLabels[post.status]}</p>
        )}
        {post.featured && (
          <p className="trade-badge">Cơ hội do Hội giới thiệu</p>
        )}
        <h2>{post.title}</h2>
        <p className="trade-price">{tradePrice(post)}</p>
        <p>{post.owner?.displayName || "Doanh nghiệp hội viên"}</p>
        <div className="trade-gallery">
          {post.images.map((image) => (
            <img
              key={image.id}
              src={tradeImage(image.url)}
              alt={post.title}
              loading="lazy"
            />
          ))}
        </div>
        <p>
          <strong>{post.summary}</strong>
        </p>
        <div className="trade-description">{post.description}</div>
        {post.promotionPercent && (
          <p className="trade-promotion">
            Ưu đãi {post.promotionPercent}% ·{" "}
            {new Date(post.promotionStartAt!).toLocaleDateString("vi-VN")} –{" "}
            {new Date(post.promotionEndAt!).toLocaleDateString("vi-VN")}
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
        <p>Địa chỉ: {post.address}</p>
        {post.googleMapsUrl && (
          <a
            href={post.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem đường đi trên Google Maps
          </a>
        )}
        {post.expiresAt && (
          <small>
            Hiệu lực đến {new Date(post.expiresAt).toLocaleString("vi-VN")}
          </small>
        )}
        {post.rejectedReason && (
          <p role="status">Hội đề nghị bổ sung: {post.rejectedReason}</p>
        )}
        <div className="trade-actions">
          {post.status === "PUBLISHED" && (
            <>
              <button disabled={task.busy} onClick={() => void save()}>
                {post.saved ? "Bỏ lưu" : "Lưu tin"}
              </button>
              <button disabled={task.busy} onClick={() => void share()}>
                Chia sẻ
              </button>
            </>
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
      {!managed && (
        <article className="surface-card">
          <h3>Kết nối với doanh nghiệp</h3>
          <p>{post.contactName}</p>
          <div className="trade-actions">
            <a
              href={"tel:" + post.contactPhone}
              onClick={() => void interaction("CONTACT_PHONE")}
            >
              Gọi {post.contactPhone}
            </a>
            {zalo && (
              <a
                href={zalo}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => void interaction("CONTACT_ZALO")}
              >
                Liên hệ Zalo
              </a>
            )}
          </div>
          {!mine && (
            <form className="trade-form" onSubmit={message}>
              <label>
                Lời nhắn hợp tác
                <textarea
                  name="message"
                  required
                  maxLength={1000}
                  placeholder="Giới thiệu nhu cầu và thông tin muốn trao đổi với doanh nghiệp."
                />
              </label>
              <button className="primary-button" disabled={task.busy}>
                Gửi lời nhắn
              </button>
            </form>
          )}
        </article>
      )}
      {!managed && (
        <TradeReviews
          key={actor?.id || "guest"}
          postId={post.id}
          actor={actor}
          ownerId={post.ownerId}
          onLogin={() => loginTrade()}
        />
      )}
    </section>
  );
}
