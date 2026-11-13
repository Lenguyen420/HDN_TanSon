export const businessLicenseImagePattern =
  /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/;
export function validBusinessLicenseImage(value: string) {
  return (
    typeof value === "string" &&
    value.length <= 1400000 &&
    businessLicenseImagePattern.test(value)
  );
}
export async function prepareBusinessLicenseImage(file: File): Promise<string> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("Chọn ảnh JPG, PNG hoặc WebP của giấy phép kinh doanh.");
  if (!file.size || file.size > 10 * 1024 * 1024)
    throw new Error("Ảnh giấy phép kinh doanh tối đa 10 MiB.");
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () =>
        reject(new Error("Không đọc được ảnh. Vui lòng chọn ảnh khác."));
      image.src = objectUrl;
    });
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
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.88),
      );
      if (blob && blob.size <= 1024 * 1024)
        return await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () =>
            reject(new Error("Không đọc được ảnh giấy phép."));
          reader.readAsDataURL(blob);
        });
      edge = Math.round(edge * 0.8);
    }
    throw new Error(
      "Ảnh quá lớn sau xử lý. Vui lòng chụp lại rõ nội dung giấy phép.",
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
