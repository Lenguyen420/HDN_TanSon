import { useState } from "react";
import PageToolbar from "@/components/shared/page-toolbar";
import ArticleImage from "@/components/shared/article-image";
import PlaceMap from "@/components/map/place-map";
import type { LocalGoController } from "@/components/map/use-localgo";
import {
  localGoDirections,
  openLocalGoLink,
  type LocalGoPlace,
} from "@/services/localgo";
import { resolveApiImage } from "@/services/api";
const days = [
  "Chủ nhật",
  "Thứ hai",
  "Thứ ba",
  "Thứ tư",
  "Thứ năm",
  "Thứ sáu",
  "Thứ bảy",
];
export default function LocalGoDetail({
  controller: c,
  place,
  managed,
}: {
  controller: LocalGoController;
  place: LocalGoPlace;
  managed: boolean;
}) {
  const [confirm, setConfirm] = useState(false),
    [linkError, setLinkError] = useState("");
  const open = async (url: string) => {
    setLinkError("");
    try {
      await openLocalGoLink(url);
    } catch (e) {
      setLinkError(e instanceof Error ? e.message : "Chưa mở được liên kết.");
    }
  };
  const category =
    c.categories.find((item) => item.code === place.category)?.name ||
    place.category;
  return (
    <main className="utility-page localgo-page">
      <PageToolbar title="Chi tiết địa điểm" onBack={c.back} />
      <ArticleImage
        src={resolveApiImage(place.coverImage)}
        alt={place.name}
        className="localgo-cover"
      />
      <div className="localgo-body">
        <span className="localgo-tag">{category}</span>
        <h1 className="localgo-place-title">{place.name}</h1>
        <p className="localgo-address">⌖ {place.address}</p>
        <p>{place.description}</p>
        <div className="localgo-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => void open(localGoDirections(place))}
          >
            Chỉ đường
          </button>
          {place.phone && (
            <a href={`tel:${place.phone.replace(/[^+0-9]/g, "")}`}>
              Gọi liên hệ
            </a>
          )}
        </div>
        {(linkError || c.error) && (
          <p className="localgo-error" role="alert">
            {linkError || c.error}
          </p>
        )}
        {place.content && (
          <section className="localgo-section">
            <h2>Giới thiệu</h2>
            <p className="localgo-prose">{place.content}</p>
          </section>
        )}
        {!!place.images?.length && (
          <section className="localgo-section">
            <h2>Hình ảnh</h2>
            <div className="localgo-gallery">
              {place.images.map((image, index) => (
                <ArticleImage
                  key={index}
                  src={resolveApiImage(image)}
                  alt={`${place.name} - ảnh ${index + 1}`}
                />
              ))}
            </div>
          </section>
        )}
        {!!place.openingHours?.length && (
          <section className="localgo-section">
            <h2>Giờ hoạt động</h2>
            {place.openingHours.map((hours, index) => (
              <p key={index}>
                {days[hours.day]}: {hours.open} – {hours.close}
              </p>
            ))}
          </section>
        )}
        {(place.website || place.zalo) && (
          <section className="localgo-section">
            <h2>Kết nối</h2>
            <div className="localgo-actions">
              {place.website && (
                <button type="button" onClick={() => void open(place.website!)}>
                  Website
                </button>
              )}
              {place.zalo && (
                <button type="button" onClick={() => void open(place.zalo!)}>
                  Zalo
                </button>
              )}
            </div>
          </section>
        )}
        <section className="localgo-section">
          <h2>Vị trí địa điểm</h2>
          <PlaceMap coordinates={place.location.coordinates} />
        </section>
        {managed && (
          <section className="localgo-section">
            <h2>Quản lý địa điểm</h2>
            <p className="localgo-hint">
              {place.isVisible
                ? "Đang hiển thị công khai"
                : "Địa điểm đang được ẩn"}
            </p>
            <div className="localgo-actions">
              <button
                type="button"
                disabled={c.busy}
                onClick={() => void c.edit(place)}
              >
                Chỉnh sửa
              </button>
              <button
                type="button"
                disabled={c.busy}
                onClick={() => void c.visibility(place)}
              >
                {place.isVisible ? "Ẩn địa điểm" : "Hiển thị lại"}
              </button>
              <button
                type="button"
                className="localgo-danger"
                disabled={c.busy}
                onClick={() => setConfirm(true)}
              >
                Xóa địa điểm
              </button>
            </div>
          </section>
        )}
        {confirm && (
          <section
            className="localgo-confirm"
            role="alertdialog"
            aria-labelledby="localgo-delete-title"
            aria-describedby="localgo-delete-description"
          >
            <h2 id="localgo-delete-title">Xóa địa điểm này?</h2>
            <p id="localgo-delete-description">
              Địa điểm sẽ không còn xuất hiện trên LocalGo. Dữ liệu vẫn được hệ
              thống lưu giữ.
            </p>
            <div className="localgo-actions">
              <button
                type="button"
                disabled={c.busy}
                onClick={() => setConfirm(false)}
              >
                Hủy
              </button>
              <button
                type="button"
                className="localgo-danger"
                disabled={c.busy}
                onClick={() => void c.remove(place)}
              >
                {c.busy ? "Đang xóa…" : "Xác nhận xóa"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
