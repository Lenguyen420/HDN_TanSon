// Tạm tắt xác thực để kiểm tra giao diện web. Bật lại bằng biến môi trường.
export const features = {
  zaloAuthentication: import.meta.env.VITE_ENABLE_ZALO_AUTH === "true",
};
