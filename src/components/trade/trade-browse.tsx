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
    [purpose, setPurpose] = useState(""),
    [sortBy, setSortBy] = useState("newest"),
    [featured, setFeatured] = useState(false),
    [minPrice, setMinPrice] = useState(""),
    [maxPrice, setMaxPrice] = useState(""),
    [page, setPage] = useState(1);
  const categories = useTradeList<TradeCategory>("trade-post-categories"),
    posts = useTradeList<TradePost>(
      (saved ? "trade-posts/me/saved" : "trade-posts") +
        tradeQuery({
          page,
          limit: 12,
          search,
          category,
          purpose,
          sortBy,
          minPrice,
          maxPrice,
          featured: featured ? true : undefined,
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
        <div className="trade-form-grid">
          <label>
            Danh mục
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả danh mục</option>
              {categories.data.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
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
        <details>
          <summary>Bộ lọc thêm</summary>
          <label>
            Mục đích
            <select
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setPage(1);
              }}
            >
              <option value="">Tất cả</option>
              <option value="COMMERCIAL">Kết nối thương mại</option>
              <option value="NON_PROFIT">Hoạt động cộng đồng</option>
            </select>
          </label>
          <div className="trade-form-grid">
            <label>
              Giá từ
              <input
                type="number"
                min="0"
                value={minPrice}
                onChange={(e) => {
                  setMinPrice(e.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              Giá đến
              <input
                type="number"
                min="0"
                value={maxPrice}
                onChange={(e) => {
                  setMaxPrice(e.target.value);
                  setPage(1);
                }}
              />
            </label>
          </div>
          <label className="trade-checkbox">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => {
                setFeatured(e.target.checked);
                setPage(1);
              }}
            />
            Tin nổi bật do Hội giới thiệu
          </label>
        </details>
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
