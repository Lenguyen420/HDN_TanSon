import { useEffect, useRef, useState, type FormEvent } from "react";
import { loginTrade, tradeImage, tradeRequest } from "@/services/trade";
import type { TradeActor, TradeComment } from "@/services/trade-types";
import { useTradeAction, useTradeList } from "./use-trade";
export default function TradeComments({
  postId,
  ownerId,
  actor,
  focusId,
}: {
  postId: string;
  ownerId: string;
  actor: TradeActor | null;
  focusId?: string;
}) {
  const [focused, setFocused] = useState<TradeComment | null>(null);
  useEffect(() => {
    let cancelled = false;
    if (focusId)
      void tradeRequest<TradeComment>(
        "trade-posts/" + postId + "/comments/" + focusId,
      )
        .then((r) => {
          if (!cancelled) setFocused(r.data);
        })
        .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [postId, focusId]);
  const [page, setPage] = useState(1),
    task = useTradeAction(),
    list = useTradeList<TradeComment>(
      "trade-posts/" + postId + "/comments?page=" + page + "&limit=20",
      false,
      15000,
    ),
    focus = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusId && !list.loading)
      (
        document.getElementById("trade-comment-" + focusId) || focus.current
      )?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [focusId, list.loading, focused?.id]);
  async function submit(e: FormEvent<HTMLFormElement>, comment?: TradeComment) {
    e.preventDefault();
    const form = e.currentTarget,
      content = String(new FormData(form).get("content") || "").trim();
    if (!content) return;
    await task.run(async () => {
      const result = await tradeRequest<TradeComment>(
        "trade-posts/" +
          postId +
          "/comments" +
          (comment ? "/" + comment.id + "/reply" : ""),
        comment ? "PUT" : "POST",
        { content },
        true,
      );
      if (focused?.id === result.data.id)
        setFocused({ ...focused, ...result.data });
      form.reset();
      setPage(1);
      list.refresh();
    });
  }
  return (
    <article
      className="surface-card trade-comments"
      ref={focus}
      id="trade-comments"
    >
      <h3>Bình luận & trao đổi</h3>
      <p className="trade-muted">Trao đổi công khai với người đăng tin.</p>
      {actor ? (
        <form className="trade-form" onSubmit={(e) => void submit(e)}>
          <label>
            Bình luận của bạn
            <textarea
              name="content"
              required
              maxLength={500}
              placeholder="Bạn muốn tìm hiểu thêm điều gì?"
            />
          </label>
          <button className="primary-button" disabled={task.busy}>
            {task.busy ? "Đang gửi…" : "Gửi bình luận"}
          </button>
        </form>
      ) : (
        <button
          onClick={() =>
            void task.run(async () => {
              await loginTrade();
            })
          }
          disabled={task.busy}
        >
          Xác thực hồ sơ để bình luận
        </button>
      )}
      {(task.error || list.error) && (
        <p role="alert">{task.error || list.error}</p>
      )}
      {list.loading ? (
        <p role="status">Đang tải bình luận…</p>
      ) : !list.data.length && !focused ? (
        <p>Chưa có bình luận. Hãy bắt đầu trao đổi.</p>
      ) : (
        [
          ...(focused && !list.data.some((c) => c.id === focused.id)
            ? [focused]
            : []),
          ...list.data,
        ].map((comment) => (
          <section
            id={"trade-comment-" + comment.id}
            key={comment.id}
            className={
              "trade-review " +
              (comment.id === focusId ? "trade-comment-highlight" : "")
            }
          >
            <div className="trade-review-person">
              <span className="trade-avatar">
                {comment.user?.avatarUrl ? (
                  <img src={tradeImage(comment.user.avatarUrl)} alt="" />
                ) : (
                  (comment.user?.displayName || "H").charAt(0)
                )}
              </span>
              <strong>{comment.user?.displayName || "Người quan tâm"}</strong>
              <time>
                {new Date(comment.createdAt).toLocaleDateString("vi-VN")}
              </time>
            </div>
            <p className="trade-comment-content">{comment.content}</p>
            {comment.replyContent && (
              <blockquote>
                <strong>Người đăng tin trả lời</strong>
                <p>{comment.replyContent}</p>
                {comment.repliedAt && (
                  <small>
                    {new Date(comment.repliedAt).toLocaleString("vi-VN")}
                  </small>
                )}
              </blockquote>
            )}
            {actor?.id === ownerId && (
              <details className="trade-reply-editor">
                <summary>
                  {comment.replyContent
                    ? "Chỉnh sửa câu trả lời"
                    : "Trả lời bình luận"}
                </summary>
                <form
                  className="trade-form"
                  onSubmit={(e) => void submit(e, comment)}
                >
                  <label>
                    Câu trả lời của bạn
                    <textarea
                      key={comment.replyContent || comment.id}
                      name="content"
                      required
                      maxLength={500}
                      defaultValue={comment.replyContent || ""}
                    />
                  </label>
                  <button className="primary-button" disabled={task.busy}>
                    Gửi trả lời
                  </button>
                </form>
              </details>
            )}
          </section>
        ))
      )}
      {(list.meta?.totalPages || 0) > 1 && (
        <div className="trade-actions">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            Trước
          </button>
          <span>
            {page}/{list.meta?.totalPages}
          </span>
          <button
            disabled={page >= (list.meta?.totalPages || 1)}
            onClick={() => setPage((p) => p + 1)}
          >
            Sau
          </button>
        </div>
      )}
    </article>
  );
}
