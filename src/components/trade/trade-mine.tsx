import { useState } from "react";
import { tradeRequest } from "@/services/trade";
import {
  tradeQuery,
  tradeStatusLabels,
  type TradePost,
} from "@/services/trade-types";
import { useTradeAction, useTradeList } from "./use-trade";
import TradeCard from "./trade-card";
export default function TradeMine({
  onOpen,
  onEdit,
  onCreate,
  onAnalytics,
  onReviews,
}: {
  onOpen: (id: string) => void;
  onEdit: (post: TradePost) => void;
  onCreate: () => void;
  onAnalytics: () => void;
  onReviews: () => void;
}) {
  const [status, setStatus] = useState(""),
    [page, setPage] = useState(1),
    task = useTradeAction(),
    list = useTradeList<TradePost>(
      "trade-posts/me" + tradeQuery({ status, page, limit: 12 }),
      true,
    );
  return (
    <section>
      <div className="trade-actions">
        <button className="primary-button" onClick={onCreate}>
          Đăng tin mới
        </button>
        <button onClick={onAnalytics}>Hiệu quả kết nối</button>
        <button onClick={onReviews}>Phản hồi đánh giá</button>
      </div>
      <label>
        Trạng thái
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">Tất cả tin của tôi</option>
          {Object.entries(tradeStatusLabels).map(([value, label]) => (
            <option value={value} key={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      {(list.error || task.error) && (
        <p role="alert">{list.error || task.error}</p>
      )}
      {list.loading ? (
        <p>Đang tải tin của doanh nghiệp…</p>
      ) : !list.data.length ? (
        <div className="surface-card">
          <p>Bạn chưa có tin trong mục này.</p>
        </div>
      ) : (
        list.data.map((post) => (
          <div key={post.id}>
            <TradeCard post={post} managed onOpen={() => onOpen(post.id)} />
            {post.rejectedReason && (
              <p>Hội đề nghị bổ sung: {post.rejectedReason}</p>
            )}
            <div className="trade-actions">
              {!["PENDING", "ARCHIVED"].includes(post.status) && (
                <button disabled={task.busy} onClick={() => onEdit(post)}>
                  Sửa tin
                </button>
              )}
              {["DRAFT", "REJECTED"].includes(post.status) && (
                <button
                  disabled={task.busy}
                  onClick={() =>
                    void task.run(async () => {
                      await tradeRequest(
                        "trade-posts/" + post.id + "/submit",
                        "PATCH",
                        {},
                        true,
                      );
                      list.refresh();
                    })
                  }
                >
                  Gửi Hội duyệt
                </button>
              )}
              <button
                disabled={task.busy}
                onClick={() => {
                  if (confirm("Xóa tin giao thương này?"))
                    void task.run(async () => {
                      await tradeRequest(
                        "trade-posts/" + post.id,
                        "DELETE",
                        undefined,
                        true,
                      );
                      list.refresh();
                    });
                }}
              >
                Xóa tin
              </button>
            </div>
          </div>
        ))
      )}
      <div className="trade-actions">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </button>
        <span>
          {page}/{list.meta?.totalPages || 1}
        </span>
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
