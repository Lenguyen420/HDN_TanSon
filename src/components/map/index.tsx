import PageToolbar from "@/components/shared/page-toolbar";
import type { UtilityPageProps } from "@/components/shared/page-props";
import { useState } from "react";
import ContentCategories from "@/components/shared/content-categories";
import PlaceMap from "./place-map";
import PlaceCard from "./place-card";
import "@/css/localgo.scss";

export default function Map({ onBack, localgo: c }: UtilityPageProps) {
  const [mode, setMode] = useState<"map" | "list">("map");
  if (!c) return null;

  return (
    <main className="utility-page localgo-page">
      <PageToolbar
        title="LocalGo"
        subtitle="Khám phá địa điểm · Kết nối Tân Sơn"
        onBack={onBack}
      />
      <div className="localgo-body">
        <section className="localgo-intro">
          <div>
            <span className="localgo-eyebrow">QUANH BẠN CÓ GÌ?</span>
            <h2>
              Mỗi điểm đến,
              <br />
              một kết nối mới.
            </h2>
            <p>Khám phá dịch vụ, doanh nghiệp và tiện ích tại Tân Sơn.</p>
          </div>
          <span className="localgo-illustration" aria-hidden="true">
            ⌖
          </span>
        </section>
        <div className="localgo-actions">
          <button type="button" onClick={() => void c.mine()} disabled={c.busy}>
            Địa điểm của tôi
          </button>
          <button
            type="button"
            className="primary-button"
            onClick={() => void c.create()}
            disabled={c.busy}
          >
            + Thêm địa điểm
          </button>
        </div>
        <label className="localgo-search">
          <span>Tìm địa điểm</span>
          <input
            type="search"
            value={c.search}
            maxLength={150}
            onChange={(e) => c.setSearch(e.target.value)}
            placeholder="Tên địa điểm, địa chỉ, từ khóa…"
          />
        </label>
        <ContentCategories
          value={c.category}
          onChange={c.setCategory}
          items={[
            { id: "", title: "Tất cả" },
            ...c.categories.map((item) => ({
              id: item.code,
              title: item.name,
            })),
          ]}
        />
        <div className="localgo-results">
          <strong>
            {c.loading ? "Đang tìm địa điểm…" : `${c.places.length} địa điểm`}
          </strong>
          <div>
            <button
              type="button"
              aria-pressed={mode === "map"}
              onClick={() => setMode("map")}
            >
              Bản đồ
            </button>
            <button
              type="button"
              aria-pressed={mode === "list"}
              onClick={() => setMode("list")}
            >
              Danh sách
            </button>
            <button
              type="button"
              disabled={c.loading}
              onClick={c.refresh}
              aria-label="Làm mới địa điểm"
            >
              ↻
            </button>
          </div>
        </div>
        {c.error && (
          <div className="localgo-error" role="alert">
            {c.error}
            <button type="button" onClick={c.refresh}>
              Thử lại
            </button>
          </div>
        )}
        {mode === "map" && (
          <PlaceMap
            places={c.places}
            onSelect={(place) => void c.open(place)}
          />
        )}
        <section aria-label="Danh sách địa điểm" aria-busy={c.loading}>
          {c.loading ? (
            <div className="localgo-empty" role="status">
              Đang tải địa điểm…
            </div>
          ) : c.places.length ? (
            c.places.map((place) => (
              <PlaceCard
                key={place.id}
                place={place}
                categories={c.categories}
                onSelect={() => void c.open(place)}
              />
            ))
          ) : (
            !c.error && (
              <div className="localgo-empty">
                <h3>Chưa tìm thấy địa điểm</h3>
                <p>Thử danh mục khác hoặc thêm địa điểm đầu tiên của bạn.</p>
              </div>
            )
          )}
        </section>
      </div>
    </main>
  );
}
