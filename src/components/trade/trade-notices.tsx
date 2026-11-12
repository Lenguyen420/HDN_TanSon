import { useState } from "react";
import { tradeRequest } from "@/services/trade";
import { tradeNoticeLabels, type TradeNotice } from "@/services/trade-types";
import { useTradeList, useTradeAction } from "./use-trade";
export default function TradeNotices({
  onOpen,
}: {
  onOpen: (notice: TradeNotice) => void;
}) {
  const [page, setPage] = useState(1),
    list = useTradeList<TradeNotice>(
      "trade-notifications?page=" + page + "&limit=20",
      true,
      15000,
    ),
    task = useTradeAction();
  return (
    <section>
      <div className="trade-actions">
        <button onClick={list.refresh}>Tải lại thông báo</button>
        <button
          disabled={task.busy || !list.data.some((n) => !n.read)}
          onClick={() =>
            void task.run(async () => {
              await tradeRequest(
                "trade-notifications/read",
                "PATCH",
                { ids: list.data.map((n) => n.id) },
                true,
              );
              list.refresh();
            })
          }
        >
          Đánh dấu đã đọc
        </button>
      </div>
      {(list.error || task.error) && (
        <p role="alert">{list.error || task.error}</p>
      )}
      {list.loading ? (
        <p>Đang tải thông báo…</p>
      ) : !list.data.length ? (
        <article className="surface-card">
          Chưa có cập nhật giao thương.
        </article>
      ) : (
        list.data.map((notice) => (
          <article key={notice.id} className="surface-card">
            <small>
              {new Date(notice.createdAt).toLocaleString("vi-VN")}
              {notice.read ? "" : " · Chưa đọc"}
            </small>
            <h3>{tradeNoticeLabels[notice.type] || "Cập nhật giao thương"}</h3>
            <p>{notice.title}</p>
            {notice.reason && <p>{notice.reason}</p>}
            <button
              onClick={() => {
                void tradeRequest(
                  "trade-notifications/read",
                  "PATCH",
                  { ids: [notice.id] },
                  true,
                ).catch(() => {});
                onOpen(notice);
              }}
            >
              Xem chi tiết
            </button>
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
