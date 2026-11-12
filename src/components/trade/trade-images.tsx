import { useEffect, useRef, useState } from "react";
import { uploadTradeImage, tradeImage, tradeRequest } from "@/services/trade";
import type { TradeImage } from "@/services/trade-types";
export default function TradeImages({
  value,
  onChange,
  max = 10,
  onBusyChange,
}: {
  value: TradeImage[];
  onChange: (images: TradeImage[]) => void;
  max?: number;
  onBusyChange?: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    created = useRef<TradeImage[]>([]),
    mounted = useRef(true);
  const discard = (image: TradeImage) => {
    URL.revokeObjectURL(image.url);
    void tradeRequest(
      "trade-media/" + image.id,
      "DELETE",
      undefined,
      true,
    ).catch(() => {});
  };
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      created.current.forEach(discard);
    };
  }, []);
  return (
    <div className="trade-image-picker">
      <p>
        Hình ảnh ({value.length}/{max})
      </p>
      <div className="trade-images">
        {value.map((image) => (
          <div key={image.id}>
            <img
              src={
                image.url.startsWith("blob:")
                  ? image.url
                  : tradeImage(image.url)
              }
              alt="Ảnh đính kèm"
            />
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                onChange(value.filter((i) => i.id !== image.id));
                if (image.url.startsWith("blob:")) discard(image);
              }}
            >
              Bỏ ảnh
            </button>
          </div>
        ))}
      </div>
      <label className="trade-upload">
        {busy ? "Đang xử lý và tải ảnh…" : "Thêm ảnh"}
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={busy || value.length >= max}
          onChange={async (e) => {
            const input = e.currentTarget,
              files = Array.from(input.files || []);
            if (value.length + files.length > max) {
              setError("Chỉ chọn tối đa " + max + " ảnh.");
              input.value = "";
              return;
            }
            setBusy(true);
            onBusyChange?.(true);
            setError("");
            const added: TradeImage[] = [];
            try {
              for (const file of files) {
                if (!mounted.current) break;
                const image = await uploadTradeImage(file);
                if (!mounted.current) {
                  discard(image);
                  break;
                }
                added.push(image);
                created.current.push(image);
              }
              if (mounted.current) onChange([...value, ...added]);
            } catch (error) {
              if (mounted.current) {
                onChange([...value, ...added]);
                setError(
                  error instanceof Error
                    ? error.message
                    : "Không tải được ảnh.",
                );
              }
            } finally {
              if (mounted.current) {
                setBusy(false);
                onBusyChange?.(false);
                input.value = "";
              }
            }
          }}
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <small>
        Ảnh được thu nhỏ trước khi tải. Ảnh đầu tiên là ảnh đại diện của tin.
      </small>
    </div>
  );
}
