import { useState, type FormEvent } from "react";
import PageToolbar from "@/components/shared/page-toolbar";
import PlaceMap from "@/components/map/place-map";
import type { LocalGoController } from "@/components/map/use-localgo";
import {
  prepareLocalGoImage,
  validCoordinates,
  type LocalGoPlace,
  type LocalGoDraft,
} from "@/services/localgo";
import ImageFields from "./image-fields";
import OpeningHours from "./opening-hours";
export default function LocalGoEditor({
  controller: c,
  place,
}: {
  controller: LocalGoController;
  place?: LocalGoPlace;
}) {
  const [draft, setDraft] = useState<LocalGoDraft>(() => ({
    name: place?.name || "",
    category: place?.category || "",
    description: place?.description || "",
    content: place?.content || "",
    address: place?.address || "",
    location: place?.location || { type: "Point", coordinates: [NaN, NaN] },
    coverImage: place?.coverImage || "",
    images: place?.images || [],
    phone: place?.phone || "",
    website: place?.website || "",
    zalo: place?.zalo || "",
    openingHours: place?.openingHours || [],
  }));
  const [imageBusy, setImageBusy] = useState(false),
    [imageError, setImageError] = useState("");
  const update = <K extends keyof LocalGoDraft>(
    key: K,
    value: LocalGoDraft[K],
  ) => setDraft((current) => ({ ...current, [key]: value }));
  const coordinates = draft.location.coordinates;
  const upload = async (files: File[], cover: boolean) => {
    setImageBusy(true);
    setImageError("");
    try {
      if (!cover && files.length + (draft.images?.length || 0) > 10)
        throw new Error("Album tối đa 10 ảnh.");
      const images: string[] = [];
      for (const file of files) images.push(await prepareLocalGoImage(file));
      if (cover) update("coverImage", images[0]);
      else update("images", [...(draft.images || []), ...images]);
    } catch (e) {
      setImageError(e instanceof Error ? e.message : "Không xử lý được ảnh.");
    } finally {
      setImageBusy(false);
    }
  };
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!imageBusy) void c.save(draft);
  };
  return (
    <main className="utility-page localgo-page">
      <PageToolbar
        title={place ? "Chỉnh sửa địa điểm" : "Thêm địa điểm"}
        subtitle="Hội viên tự đăng · Không cần chờ duyệt"
        onBack={() => {
          if (
            !c.busy &&
            !imageBusy &&
            (!draft.name ||
              window.confirm("Rời biểu mẫu? Thay đổi chưa lưu sẽ bị mất."))
          )
            c.back();
        }}
      />
      <form className="localgo-body localgo-form" onSubmit={submit}>
        <p className="localgo-hint">
          Thông tin có dấu * là bắt buộc. Địa điểm mới sẽ hiển thị ngay sau khi
          đăng.
        </p>
        <fieldset disabled={c.busy || imageBusy}>
          <label>
            Tên địa điểm *
            <input
              required
              maxLength={200}
              value={draft.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Tên cơ sở hoặc chi nhánh"
            />
          </label>
          <label>
            Danh mục *
            <select
              required
              value={draft.category}
              onChange={(e) => update("category", e.target.value)}
            >
              <option value="">Chọn danh mục</option>
              {c.categories.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
          <ImageFields
            cover={draft.coverImage}
            images={draft.images || []}
            onUpload={upload}
            onRemove={(index) =>
              update(
                "images",
                draft.images?.filter((_, i) => i !== index),
              )
            }
          />
          <label>
            Mô tả ngắn *
            <textarea
              required
              maxLength={1000}
              rows={3}
              value={draft.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Điểm nổi bật, sản phẩm hoặc dịch vụ…"
            />
          </label>
          <label>
            Giới thiệu chi tiết
            <textarea
              maxLength={20000}
              rows={5}
              value={draft.content}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Nội dung giới thiệu bằng văn bản"
            />
          </label>
          <label>
            Địa chỉ *
            <input
              required
              maxLength={500}
              value={draft.address}
              onChange={(e) => update("address", e.target.value)}
              placeholder="Số nhà, đường, phường…"
            />
          </label>
          <section className="localgo-section">
            <h2>Vị trí trên bản đồ *</h2>
            <p className="localgo-hint">
              Chạm vào bản đồ để đặt vị trí, hoặc nhập tọa độ chính xác. Không
              cần cấp quyền vị trí.
            </p>
            <PlaceMap
              coordinates={
                validCoordinates(coordinates) ? coordinates : undefined
              }
              onPick={(value) =>
                update("location", { type: "Point", coordinates: value })
              }
            />
            <div className="localgo-coordinate-fields">
              {([1, 0] as const).map((index) => (
                <label key={index}>
                  {index === 1 ? "Vĩ độ *" : "Kinh độ *"}
                  <input
                    required
                    type="number"
                    step="any"
                    min={index === 1 ? -90 : -180}
                    max={index === 1 ? 90 : 180}
                    value={
                      Number.isFinite(coordinates[index])
                        ? coordinates[index]
                        : ""
                    }
                    onChange={(e) => {
                      const next: [number, number] = [...coordinates];
                      next[index] =
                        e.target.value === "" ? NaN : Number(e.target.value);
                      update("location", { type: "Point", coordinates: next });
                    }}
                  />
                </label>
              ))}
            </div>
          </section>
          <label>
            Điện thoại
            <input
              type="tel"
              maxLength={30}
              pattern="[+0-9(). \-]{7,30}"
              value={draft.phone}
              onChange={(e) => update("phone", e.target.value)}
              placeholder="Số điện thoại liên hệ"
            />
          </label>
          <label>
            Website
            <input
              type="url"
              maxLength={2048}
              value={draft.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://…"
            />
          </label>
          <label>
            Liên kết Zalo
            <input
              type="url"
              maxLength={2048}
              value={draft.zalo}
              onChange={(e) => update("zalo", e.target.value)}
              placeholder="https://zalo.me/…"
            />
          </label>
          <OpeningHours
            value={draft.openingHours || []}
            onChange={(value) => update("openingHours", value)}
          />
        </fieldset>
        {(imageError || c.error) && (
          <p className="localgo-error" role="alert">
            {imageError || c.error}
          </p>
        )}
        <button
          type="submit"
          className="primary-button localgo-submit"
          disabled={c.busy || imageBusy}
        >
          {imageBusy
            ? "Đang xử lý ảnh…"
            : c.busy
              ? "Đang lưu…"
              : place
                ? "Lưu thay đổi"
                : "Đăng địa điểm ngay"}
        </button>
      </form>
    </main>
  );
}
