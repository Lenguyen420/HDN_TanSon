// Cấu hình xác thực thật và chế độ xem thử giao thương qua biến môi trường.
export const features = {
  tradePreview:
    import.meta.env.DEV === true &&
    import.meta.env.VITE_TRADE_PREVIEW === "true",
  zaloAuthentication: import.meta.env.VITE_ENABLE_ZALO_AUTH === "true",
};
