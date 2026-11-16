import { useEffect, useState } from "react";
import { getFeeProofImage, type FeePayment } from "@/services/membership-fees";
export default function FeeProofPreview({ payment }: { payment: FeePayment }) {
  const [open, setOpen] = useState(false),
    [image, setImage] = useState(""),
    [error, setError] = useState("");
  const managed = payment.proofUrl?.startsWith("/api/v1/membership-fees/");
  useEffect(() => {
    if (!open || !managed) return;
    let active = true;
    void getFeeProofImage(payment.id)
      .then((value) => {
        if (active) setImage(value);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [open, managed, payment.id]);
  if (!payment.proofUrl) return null;
  if (!managed)
    return (
      <a href={payment.proofUrl} target="_blank" rel="noreferrer">
        Xem minh chứng đã gửi
      </a>
    );
  return (
    <div>
      <button type="button" onClick={() => setOpen((v) => !v)}>
        {open ? "Ẩn ảnh" : "Xem ảnh minh chứng"}
      </button>
      {open &&
        (error ? (
          <p role="alert">{error}</p>
        ) : image ? (
          <img
            className="fee-proof-preview"
            src={image}
            alt="Minh chứng thanh toán đã gửi"
          />
        ) : (
          <p role="status">Đang tải ảnh…</p>
        ))}
    </div>
  );
}
