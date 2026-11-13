import { useRef, useState } from "react";
import { prepareBusinessLicenseImage } from "@/services/business-license";

export default function BusinessLicenseField({
  value,
  onChange,
  onBusyChange,
}: {
  value: string;
  onChange: (value: string) => void;
  onBusyChange: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="member-registration-field">
      <label htmlFor="business-license-image">
        Ảnh giấy phép kinh doanh <span aria-hidden="true">*</span>
      </label>
      <input
        id="business-license-image"
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        required={!value}
        disabled={busy}
        aria-describedby="business-license-help"
        onChange={async (event) => {
          const file = event.currentTarget.files?.[0];
          onChange("");
          setError("");
          if (!file) return;
          setBusy(true);
          onBusyChange(true);
          try {
            onChange(await prepareBusinessLicenseImage(file));
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : "Không xử lý được ảnh.",
            );
            if (input.current) input.current.value = "";
          } finally {
            setBusy(false);
            onBusyChange(false);
          }
        }}
      />
      <small id="business-license-help">
        Bắt buộc đính kèm ảnh rõ nội dung giấy phép. JPG, PNG hoặc WebP, tối đa
        10 MiB; ảnh được thu gọn trước khi gửi.
      </small>
      {busy && <p role="status">Đang xử lý ảnh…</p>}
      {error && (
        <p className="form-status" role="alert">
          {error}
        </p>
      )}
      {value && (
        <>
          <img
            src={value}
            alt="Ảnh giấy phép kinh doanh đã chọn"
            style={{
              display: "block",
              width: "100%",
              maxHeight: 360,
              objectFit: "contain",
              borderRadius: 12,
            }}
          />
          <button
            type="button"
            onClick={() => {
              onChange("");
              if (input.current) input.current.value = "";
            }}
          >
            Chọn lại ảnh giấy phép
          </button>
        </>
      )}
    </div>
  );
}
