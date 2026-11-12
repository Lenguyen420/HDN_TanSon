interface ZaloConsentProps {
  onConfirm: () => void;
  pending: boolean;
  confirmed: boolean;
  error?: string;
  message?: string;
}

export default function ZaloConsent({ onConfirm, pending, confirmed, error, message }: ZaloConsentProps) {
  return (
    <section className="surface-card" aria-labelledby="zalo-consent-title" aria-busy={pending}>
      <h2 id="zalo-consent-title">Thông tin tài khoản Zalo</h2>
      <p>Hội Doanh nghiệp Phường Tân Sơn sử dụng tên và ảnh đại diện để nhận diện tài khoản. Bạn có thể chia sẻ thêm số điện thoại để đối chiếu hồ sơ hội viên.</p>
      <p>Bạn quyết định các thông tin được chia sẻ trong hộp thoại cấp quyền của Zalo.</p>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <button type="button" className="primary-button" disabled={pending} onClick={onConfirm}>
        {pending ? "Đang xác nhận…" : confirmed ? "Cập nhật quyền chia sẻ Zalo" : "Xác nhận thông tin Zalo"}
      </button>
    </section>
  );
}
