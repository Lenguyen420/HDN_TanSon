import PageToolbar from "@/components/shared/page-toolbar";
import PlaceCard from "@/components/map/place-card";
import type { LocalGoController } from "@/components/map/use-localgo";
export default function LocalGoMine({
  controller: c,
}: {
  controller: LocalGoController;
}) {
  return (
    <main className="utility-page localgo-page">
      <PageToolbar
        title="Địa điểm của tôi"
        subtitle="Quản lý các cơ sở và chi nhánh của bạn"
        onBack={c.back}
      />
      <div className="localgo-body">
        <div className="localgo-actions">
          <button type="button" onClick={c.refresh} disabled={c.loading}>
            Làm mới
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
          <span>Tìm trong địa điểm của bạn</span>
          <input
            type="search"
            maxLength={150}
            value={c.search}
            onChange={(e) => c.setSearch(e.target.value)}
            placeholder="Tên hoặc địa chỉ…"
          />
        </label>
        {c.notice && (
          <p className="localgo-success" role="status">
            {c.notice}
          </p>
        )}
        {c.error && (
          <p className="localgo-error" role="alert">
            {c.error}
          </p>
        )}
        <p className="localgo-hint">
          {c.places.length} địa điểm · Địa điểm hợp lệ được công bố ngay.
        </p>
        {c.loading ? (
          <p role="status">Đang tải địa điểm của bạn…</p>
        ) : c.places.length ? (
          c.places.map((place) => (
            <PlaceCard
              key={place.id}
              place={place}
              categories={c.categories}
              managed
              onSelect={() => void c.open(place, true)}
            />
          ))
        ) : (
          !c.error && (
            <div className="localgo-empty">
              <h2>Đưa doanh nghiệp lên bản đồ</h2>
              <p>Thêm địa điểm đầu tiên để cộng đồng dễ dàng tìm thấy bạn.</p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
