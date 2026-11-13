import { useState } from "react";
import {
  tradeQuery,
  type TradePost,
  type TradeCategory,
} from "@/services/trade-types";
import { useTradeList } from "./use-trade";
import TradeCard from "./trade-card";
export default function TradeBrowse({
  saved = false,
  onOpen,
}: {
  saved?: boolean;
  onOpen: (id: string) => void;
}) {
  const [search, setSearch] = useState(""),
    [category, setCategory] = useState(""),
    [sortBy, setSortBy] = useState("newest"),
    [page, setPage] = useState(1);
  const categories = useTradeList<TradeCategory>("trade-post-categories"),
    posts = useTradeList<TradePost>(
      (saved ? "trade-posts/me/saved" : "trade-posts") +
        tradeQuery({
          page,
          limit: 12,
          search,
          category,
          sortBy,
        }),
      saved,
    );
  return (
    <section>
      <form
        className="trade-search"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
        }}
      >
        <label>
          Tìm cơ hội hợp tác
          <input
            placeholder="Sản phẩm, dịch vụ, doanh nghiệp…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
        </label>
        <div className="trade-category-tabs" aria-label="Danh mục giao thương">
          <button
            type="button"
            aria-pressed={!category}
            onClick={() => {
              setCategory("");
              setPage(1);
            }}
          >
            Tất cả
          </button>
          {categories.data.map((c) => (
            <button
              key={c.id}
              type="button"
              aria-pressed={category === c.code}
              onClick={() => {
                setCategory(c.code);
                setPage(1);
              }}
            >
              {c.name}
            </button>
          ))}
        </div>
        <div className="trade-sort-row">
          <label>
            Sắp xếp
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Mới nhất</option>
              <option value="popular">Được quan tâm</option>
              <option value="rating">Đánh giá cao</option>
              <option value="price_asc">Giá tăng dần</option>
              <option value="price_desc">Giá giảm dần</option>
            </select>
          </label>
        </div>
      </form>
      {(posts.error || categories.error) && (
        <p role="alert">{posts.error || categories.error}</p>
      )}
      {posts.loading ? (
        <p role="status">Đang tải cơ hội giao thương…</p>
      ) : posts.data.length ? (
        posts.data.map((post) => (
          <TradeCard key={post.id} post={post} onOpen={() => onOpen(post.id)} />
        ))
      ) : (
        <div className="surface-card">
          <p>
            {saved
              ? "Bạn chưa lưu tin phù hợp."
              : "Chưa có tin phù hợp. Bạn có thể đổi bộ lọc hoặc quay lại sau."}
          </p>
        </div>
      )}
      <div className="trade-actions">
        <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
          Trước
        </button>
        <span>
          {page}/{posts.meta?.totalPages || 1}
        </span>
        <button
          disabled={page >= (posts.meta?.totalPages || 1)}
          onClick={() => setPage((p) => p + 1)}
        >
          Sau
        </button>
      </div>
    </section>
  );
}
