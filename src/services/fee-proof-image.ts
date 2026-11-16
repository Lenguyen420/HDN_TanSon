export const feeProofImagePattern =
  /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
export function validFeeProofImage(value: string) {
  return (
    typeof value === "string" &&
    value.length <= 1400000 &&
    feeProofImagePattern.test(value)
  );
}
export async function prepareFeeProofImage(file: File): Promise<string> {
  const declared = file.type?.toLowerCase();
  const extension = file.name?.split(".").pop()?.toLowerCase();
  const inferred =
    extension &&
    (
      {
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        png: "image/png",
        webp: "image/webp",
      } as Record<string, string>
    )[extension];
  const type =
    !declared || declared === "application/octet-stream"
      ? inferred
      : declared === "image/jpg"
        ? "image/jpeg"
        : declared;
  if (!type || !["image/jpeg", "image/png", "image/webp"].includes(type))
    throw new Error(
      "Chọn ảnh JPG, PNG hoặc WebP. Với ảnh HEIC trên iPhone, hãy chọn ảnh chụp màn hình hoặc chuyển ảnh sang JPG.",
    );
  if (!file.size || file.size > 10 * 1024 * 1024)
    throw new Error("Ảnh minh chứng thanh toán tối đa 10 MiB.");
  const objectUrl = URL.createObjectURL(file),
    image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timer);
        image.onload = null;
        image.onerror = null;
        error ? reject(error) : resolve();
      };
      const timer = setTimeout(
        () =>
          finish(
            new Error(
              "Đọc ảnh quá lâu. Vui lòng chọn lại ảnh hoặc dùng ảnh chụp màn hình.",
            ),
          ),
        20000,
      );
      image.onload = () => finish();
      image.onerror = () =>
        finish(
          new Error(
            "Không đọc được ảnh. Vui lòng chọn ảnh JPG, PNG hoặc WebP khác.",
          ),
        );
      image.src = objectUrl;
    });
    if (!image.naturalWidth || !image.naturalHeight)
      throw new Error(
        "Ảnh không có kích thước hợp lệ. Vui lòng chọn ảnh khác.",
      );
    let edge = 2000;
    for (let attempt = 0; attempt < 6; attempt++) {
      const ratio = Math.min(
        1,
        edge / Math.max(image.naturalWidth, image.naturalHeight),
      );
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Không xử lý được ảnh trên thiết bị này.");
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      // Avoid toBlob/FileReader callbacks getting suspended by the mobile picker.
      const result = canvas.toDataURL("image/jpeg", 0.88);
      const encoded = result.split(",")[1] || "";
      const bytes =
        Math.floor((encoded.length * 3) / 4) -
        (encoded.endsWith("==") ? 2 : encoded.endsWith("=") ? 1 : 0);
      if (validFeeProofImage(result) && bytes > 0 && bytes <= 1024 * 1024)
        return result;
      edge = Math.round(edge * 0.8);
    }
    throw new Error(
      "Ảnh quá lớn sau xử lý. Vui lòng chụp lại rõ nội dung minh chứng.",
    );
  } finally {
    image.onload = null;
    image.onerror = null;
    URL.revokeObjectURL(objectUrl);
  }
}
