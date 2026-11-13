import { useState, type FormEvent } from "react";
import { tradeRequest } from "@/services/trade";
import type {
  TradePost,
  TradeActor,
  TradeCategory,
  TradeImage,
} from "@/services/trade-types";
import { useTradeAction, useTradeList } from "./use-trade";
import TradeImages from "./trade-images";
const localDate = (value?: string | null) =>
  value
    ? new Date(
        new Date(value).getTime() - new Date(value).getTimezoneOffset() * 60000,
      )
        .toISOString()
        .slice(0, 16)
    : "";
export default function TradeEditor({
  post,
  actor,
  onDone,
  onCancel,
}: {
  post?: TradePost;
  actor: TradeActor;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [purpose, setPurpose] = useState(
      post?.purpose ||
        (actor.businessType === "TEMPLE_MANAGEMENT"
          ? "NON_PROFIT"
          : "COMMERCIAL"),
    ),
    [category, setCategory] = useState(post?.category || ""),
    [priceType, setPriceType] = useState(post?.priceType || "CONTACT"),
    [images, setImages] = useState<TradeImage[]>(post?.images || []);
  const [imagesBusy, setImagesBusy] = useState(false);
  const [savedId, setSavedId] = useState(post?.id);
  const [sendForReview, setSendForReview] = useState(true);
  const categories = useTradeList<TradeCategory>("trade-post-categories"),
    task = useTradeAction(),
    promotion = categories.data.find(
      (c) => c.code === category,
    )?.requiresPromotionDetails;
  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget),
      body: Record<string, unknown> = {
        purpose,
        category,
        imageIds: images.map((i) => i.id),
        priceType: purpose === "COMMERCIAL" ? priceType : null,
      };
    for (const key of [
      "title",
      "summary",
      "description",
      "address",
      "contactName",
      "contactPhone",
    ])
      body[key] = String(data.get(key) || "").trim();
    for (const key of ["priceLabel", "contactZalo", "googleMapsUrl"])
      body[key] = String(data.get(key) || "").trim() || null;
    for (const key of ["price", "lat", "lng", "promotionPercent"])
      body[key] = data.get(key) ? Number(data.get(key)) : null;
    for (const key of [
      "promotionStartAt",
      "promotionEndAt",
      "eventStartAt",
      "eventEndAt",
      "expiresAt",
    ])
      body[key] = data.get(key)
        ? new Date(String(data.get(key))).toISOString()
        : null;
    await task.run(async () => {
      const result = await tradeRequest<TradePost>(
        savedId ? "trade-posts/" + savedId : "trade-posts",
        savedId ? "PATCH" : "POST",
        body,
        true,
      );
      setSavedId(result.data.id);
      if (sendForReview && ["DRAFT", "REJECTED"].includes(result.data.status))
        await tradeRequest(
          "trade-posts/" + result.data.id + "/submit",
          "PATCH",
          {},
          true,
        );
      onDone();
    });
  }
  return (
    <form className="surface-card trade-form" onSubmit={save}>
      <h2>{post ? "Chỉnh sửa tin giao thương" : "Đăng cơ hội giao thương"}</h2>
      <p>
        Chia sẻ sản phẩm, dịch vụ hoặc hoạt động cộng đồng của doanh nghiệp đến
        hội viên. Tin sẽ được Hội kiểm duyệt trước khi công bố.
      </p>
      <fieldset disabled={task.busy}>
        <label>
          Mục đích
          <select
            value={purpose}
            onChange={(e) => {
              setPurpose(e.target.value as TradePost["purpose"]);
              if (e.target.value === "NON_PROFIT" && promotion) setCategory("");
            }}
          >
            {actor.businessType !== "TEMPLE_MANAGEMENT" && (
              <option value="COMMERCIAL">Kết nối thương mại</option>
            )}
            <option value="NON_PROFIT">Kết nối cộng đồng, phi lợi nhuận</option>
          </select>
        </label>
        <label>
          Danh mục
          <select
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Chọn danh mục phù hợp</option>
            {categories.data
              .filter(
                (c) => purpose !== "NON_PROFIT" || !c.requiresPromotionDetails,
              )
              .map((c) => (
                <option value={c.code} key={c.id}>
                  {c.name}
                </option>
              ))}
          </select>
        </label>
        {categories.error && <p role="alert">{categories.error}</p>}
        {!categories.loading &&
          !categories.error &&
          !categories.data.length && (
            <p role="status">
              Hội đang cập nhật danh mục giao thương. Vui lòng quay lại sau.
            </p>
          )}
        <label>
          Tiêu đề
          <input
            name="title"
            required
            maxLength={200}
            defaultValue={post?.title}
            placeholder="Tên sản phẩm, dịch vụ hoặc cơ hội hợp tác"
          />
        </label>
        <label>
          Tóm tắt
          <textarea
            name="summary"
            required
            maxLength={500}
            defaultValue={post?.summary}
            placeholder="Điểm nổi bật dành cho đối tác và hội viên"
          />
        </label>
        <label>
          Nội dung chi tiết
          <textarea
            name="description"
            required
            maxLength={5000}
            defaultValue={post?.description}
          />
        </label>
        <TradeImages
          value={images}
          onChange={setImages}
          onBusyChange={setImagesBusy}
        />
        {images.length > 1 && (
          <label>
            Ảnh đại diện
            <select
              value={images[0]?.id || ""}
              onChange={(e) => {
                const first = images.find((i) => i.id === e.target.value)!;
                setImages([first, ...images.filter((i) => i.id !== first.id)]);
              }}
            >
              {images.map((image, index) => (
                <option key={image.id} value={image.id}>
                  Ảnh {index + 1}
                </option>
              ))}
            </select>
          </label>
        )}
        {purpose === "COMMERCIAL" ? (
          <>
            <label>
              Hình thức giá
              <select
                value={priceType}
                onChange={(e) =>
                  setPriceType(
                    e.target.value as "FIXED" | "NEGOTIABLE" | "CONTACT",
                  )
                }
              >
                <option value="CONTACT">Liên hệ báo giá</option>
                <option value="NEGOTIABLE">Giá thỏa thuận</option>
                <option value="FIXED">Giá cố định</option>
              </select>
            </label>
            {priceType !== "CONTACT" && (
              <label>
                Giá (đồng)
                <input
                  name="price"
                  type="number"
                  min={priceType === "FIXED" ? 0.01 : 0}
                  step="0.01"
                  required={priceType === "FIXED"}
                  defaultValue={post?.price ?? ""}
                />
              </label>
            )}
            <label>
              Ghi chú giá
              <input
                name="priceLabel"
                maxLength={100}
                defaultValue={post?.priceLabel || ""}
                placeholder="Ví dụ: Ưu đãi dành cho hội viên"
              />
            </label>
          </>
        ) : (
          <>
            <label>
              Hoạt động bắt đầu
              <input
                type="datetime-local"
                name="eventStartAt"
                defaultValue={localDate(post?.eventStartAt)}
              />
            </label>
            <label>
              Hoạt động kết thúc
              <input
                type="datetime-local"
                name="eventEndAt"
                defaultValue={localDate(post?.eventEndAt)}
              />
            </label>
          </>
        )}
        {promotion && (
          <>
            <label>
              Ưu đãi (%)
              <input
                type="number"
                name="promotionPercent"
                required
                min={1}
                max={100}
                defaultValue={post?.promotionPercent ?? ""}
              />
            </label>
            <label>
              Áp dụng từ
              <input
                type="datetime-local"
                name="promotionStartAt"
                required
                defaultValue={localDate(post?.promotionStartAt)}
              />
            </label>
            <label>
              Áp dụng đến
              <input
                type="datetime-local"
                name="promotionEndAt"
                required
                defaultValue={localDate(post?.promotionEndAt)}
              />
            </label>
          </>
        )}
        <label>
          Địa chỉ doanh nghiệp / địa điểm
          <input
            name="address"
            required
            maxLength={300}
            defaultValue={post?.address}
          />
        </label>
        <label>
          Liên kết Google Maps
          <input
            name="googleMapsUrl"
            type="url"
            maxLength={2048}
            defaultValue={post?.googleMapsUrl || ""}
          />
        </label>
        <details>
          <summary>Tọa độ địa điểm (không bắt buộc)</summary>
          <div className="trade-form-grid">
            <label>
              Vĩ độ
              <input
                type="number"
                name="lat"
                min={-90}
                max={90}
                step="0.000001"
                defaultValue={post?.lat ?? ""}
              />
            </label>
            <label>
              Kinh độ
              <input
                type="number"
                name="lng"
                min={-180}
                max={180}
                step="0.000001"
                defaultValue={post?.lng ?? ""}
              />
            </label>
          </div>
        </details>
        <label>
          Người liên hệ
          <input
            name="contactName"
            required
            maxLength={120}
            defaultValue={post?.contactName || actor.displayName}
          />
        </label>
        <label>
          Điện thoại
          <input
            name="contactPhone"
            required
            type="tel"
            pattern="(\+?84|0)[0-9]{9}"
            defaultValue={post?.contactPhone}
          />
        </label>
        <label>
          Zalo liên hệ
          <input
            name="contactZalo"
            maxLength={120}
            defaultValue={post?.contactZalo || ""}
            placeholder="Số điện thoại hoặc mã Zalo"
          />
        </label>
        <label>
          Tin có hiệu lực đến
          <input
            type="datetime-local"
            name="expiresAt"
            defaultValue={localDate(post?.expiresAt)}
          />
        </label>
        {(!post || ["DRAFT", "REJECTED"].includes(post.status)) && (
          <label className="trade-checkbox">
            <input
              type="checkbox"
              name="submit"
              checked={sendForReview}
              onChange={(e) => setSendForReview(e.target.checked)}
            />
            Gửi Hội kiểm duyệt sau khi lưu
          </label>
        )}
        {post?.status === "PUBLISHED" && (
          <p>
            Thay đổi tiêu đề, nội dung, danh mục, mục đích hoặc giá sẽ cần Hội
            duyệt lại.
          </p>
        )}
        {task.error && <p role="alert">{task.error}</p>}
        <div className="trade-actions">
          <button
            className="primary-button"
            disabled={!categories.data.length || task.busy || imagesBusy}
          >
            {task.busy
              ? "Đang lưu tin…"
              : sendForReview &&
                  (!post || ["DRAFT", "REJECTED"].includes(post.status))
                ? "Lưu và gửi duyệt"
                : "Lưu tin giao thương"}
          </button>
          <button type="button" onClick={onCancel}>
            Quay lại
          </button>
        </div>
      </fieldset>
    </form>
  );
}
