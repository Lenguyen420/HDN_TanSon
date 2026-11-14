import ArticleImage from "@/components/shared/article-image";
import { resolveApiImage } from "@/services/api";
export default function ImageFields({
  cover,
  images,
  onUpload,
  onRemove,
}: {
  cover: string;
  images: string[];
  onUpload: (files: File[], cover: boolean) => Promise<void>;
  onRemove: (index: number) => void;
}) {
  return (
    <section className="localgo-section">
      <h2>Hình ảnh địa điểm</h2>
      <label>
        Ảnh đại diện *
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            if (files.length) void onUpload(files, true);
          }}
        />
      </label>
      {cover && (
        <ArticleImage
          className="localgo-image-preview"
          src={resolveApiImage(cover)}
          alt="Ảnh đại diện địa điểm"
        />
      )}
      <label>
        Album ảnh ({images.length}/10)
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={images.length >= 10}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            e.target.value = "";
            if (files.length) void onUpload(files, false);
          }}
        />
      </label>
      <p className="localgo-hint">
        JPG, PNG hoặc WebP; tối đa 10 MB mỗi ảnh. Ảnh được thu nhỏ trước khi
        đăng.
      </p>
      <div className="localgo-gallery">
        {images.map((image, index) => (
          <div key={index}>
            <ArticleImage
              src={resolveApiImage(image)}
              alt={`Ảnh album ${index + 1}`}
            />
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={`Xóa ảnh ${index + 1}`}
            >
              Xóa ảnh
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
