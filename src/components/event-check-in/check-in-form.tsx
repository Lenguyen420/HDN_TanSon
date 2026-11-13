import { useRef, useState } from "react";

export default function CheckInForm({
  name,
  company,
  onSubmit,
}: {
  name: string;
  company: string;
  onSubmit: () => Promise<{ persisted: boolean }>;
}) {
  const locked = useRef(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function confirm() {
    if (locked.current) return;
    locked.current = true;
    setPending(true);
    setError("");
    try {
      const result = await onSubmit();
      if (!result.persisted)
        setError(
          "Đã điểm danh trên hệ thống. Thiết bị không lưu được mã theo dõi; hãy giữ màn hình xác nhận.",
        );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Không thể điểm danh. Vui lòng thử lại.",
      );
    } finally {
      locked.current = false;
      setPending(false);
    }
  }
  return (
    <section className="event-check-in-form">
      <h2>Xác nhận tham dự</h2>
      <p>Điểm danh bằng thông tin bạn đã đăng ký tham gia sự kiện.</p>
      <p>
        <strong>{name}</strong>
        {company && (
          <>
            <br />
            {company}
          </>
        )}
      </p>
      {error && (
        <p className="form-status" role="alert">
          {error}
        </p>
      )}
      <button
        className="primary-button"
        type="button"
        disabled={pending}
        onClick={() => void confirm()}
      >
        {pending ? "Đang xác nhận…" : "Xác nhận điểm danh"}
      </button>
    </section>
  );
}
