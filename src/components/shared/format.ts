export const formatMoney = (amount: number) => new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(amount);
export const formatDate = (date: string) => date.split("-").reverse().join("/");
