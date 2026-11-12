import { useEffect, useState, type FormEvent } from "react";
import { tradeRequest, watchTradeConversation } from "@/services/trade";
import type {
  TradeActor,
  TradeConversation,
  TradeMessage,
} from "@/services/trade-types";
import { useTradeList, useTradeAction } from "./use-trade";
export default function TradeInbox({
  actor,
  initial,
  onOpenPost,
}: {
  actor: TradeActor;
  initial?: TradeConversation;
  onOpenPost: (id: string) => void;
}) {
  const [page, setPage] = useState(1),
    [selected, setSelected] = useState<TradeConversation | null>(
      initial || null,
    ),
    [messages, setMessages] = useState<TradeMessage[]>([]),
    [messagePage, setMessagePage] = useState(1),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0),
    task = useTradeAction();
  const list = useTradeList<TradeConversation>(
    "trade-conversations?page=" + page + "&limit=20",
    true,
  );
  useEffect(() => {
    if (!selected) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await tradeRequest<TradeMessage[]>(
          "trade-conversations/" +
            selected.id +
            "/messages?page=" +
            messagePage +
            "&limit=30",
          "GET",
          undefined,
          true,
        );
        if (!cancelled) {
          setMessages(result.data);
          setError("");
        }
        await tradeRequest(
          "trade-conversations/" + selected.id + "/read",
          "PATCH",
          {},
          true,
        );
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Không tải được tin nhắn.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selected?.id, messagePage, revision]);
  useEffect(() => {
    if (!selected) return;
    return watchTradeConversation(selected.id, () => {
      if (!document.hidden) setRevision((v) => v + 1);
    });
  }, [selected?.id]);
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const form = event.currentTarget,
      content = String(new FormData(form).get("content") || "").trim();
    await task.run(async () => {
      await tradeRequest(
        "trade-conversations/" + selected.id + "/messages",
        "POST",
        { content },
        true,
      );
      form.reset();
      setMessagePage(1);
      setRevision((v) => v + 1);
      list.refresh();
    });
  }
  return (
    <section>
      {selected ? (
        <article className="surface-card">
          <div className="trade-actions">
            <button onClick={() => setSelected(null)}>Các hội thoại</button>
            <button onClick={() => onOpenPost(selected.tradePostId)}>
              Xem tin giao thương
            </button>
          </div>
          <h3>{selected.post?.title || "Trao đổi hợp tác"}</h3>
          <p>
            Trao đổi rõ nhu cầu và kiểm tra thông tin doanh nghiệp trước khi hợp
            tác.
          </p>
          {(error || task.error) && <p role="alert">{error || task.error}</p>}
          <div className="trade-actions">
            <button
              disabled={messages.length < 30}
              onClick={() => setMessagePage((p) => p + 1)}
            >
              Tin cũ hơn
            </button>
            {messagePage > 1 && (
              <button onClick={() => setMessagePage((p) => p - 1)}>
                Tin mới hơn
              </button>
            )}
          </div>
          <div className="trade-thread" aria-live="polite">
            {messages.map((message) => (
              <article
                key={message.id}
                className={message.senderId === actor.id ? "is-mine" : ""}
              >
                <strong>
                  {message.senderId === actor.id
                    ? "Bạn"
                    : selected.other || "Đối tác"}
                </strong>
                <p>{message.content}</p>
                <small>
                  {new Date(message.createdAt).toLocaleString("vi-VN")}
                  {message.senderId === actor.id && message.readAt
                    ? " · Đã đọc"
                    : ""}
                </small>
              </article>
            ))}
          </div>
          <form onSubmit={send} className="trade-form">
            <label>
              Tin nhắn
              <textarea
                name="content"
                required
                maxLength={1000}
                placeholder="Nhập nội dung trao đổi…"
              />
            </label>
            <button className="primary-button" disabled={task.busy}>
              {task.busy ? "Đang gửi…" : "Gửi tin nhắn"}
            </button>
          </form>
        </article>
      ) : (
        <>
          {list.error && <p role="alert">{list.error}</p>}
          {list.loading ? (
            <p>Đang tải hội thoại…</p>
          ) : list.data.length ? (
            list.data.map((row) => (
              <article key={row.id} className="surface-card">
                <button
                  className="trade-post-open"
                  onClick={() => {
                    setSelected(row);
                    setMessagePage(1);
                  }}
                >
                  <span>
                    <strong>{row.post?.title || "Tin giao thương"}</strong>
                    <span>{row.other || "Đối tác"}</span>
                    <small>
                      {new Date(row.lastMessageAt).toLocaleString("vi-VN")}
                      {row.unreadCount
                        ? " · " + row.unreadCount + " tin chưa đọc"
                        : ""}
                    </small>
                  </span>
                </button>
              </article>
            ))
          ) : (
            <article className="surface-card">
              <p>
                Chưa có hội thoại. Mở một tin phù hợp và gửi lời nhắn để kết nối
                với doanh nghiệp.
              </p>
            </article>
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
            <button onClick={list.refresh}>Tải lại</button>
          </div>
        </>
      )}
    </section>
  );
}
