import { tradeRequest } from "./trade";

export type TradeContactChannel = "phone" | "zalo";

export function tradeContactHref(channel: TradeContactChannel, value?: string | null) {
  const contact = value?.trim() || "";
  if (channel === "phone") {
    const number = contact.replace(/[\s().-]/g, "");
    if (!/^(?:\+?84|0)\d{9}$/.test(number)) return "";
    return "tel:" + number.replace(/^84/, "+84");
  }
  const id = contact.replace(/^(?:https?:\/\/)?zalo\.me\//i, "").replace(/\/$/, "");
  return /^[a-z0-9_+.-]+$/i.test(id) && id !== "." && id !== ".."
    ? "https://zalo.me/" + encodeURIComponent(id)
    : "";
}

export function trackTradeContact(postId: string, channel: TradeContactChannel) {
  void tradeRequest("trade-posts/" + encodeURIComponent(postId) + "/interactions", "POST", {
    type: channel === "phone" ? "CONTACT_PHONE" : "CONTACT_ZALO",
  }).catch(() => {});
}

export function isZaloTradeContact() {
  return window.location.hostname === "h5.zdn.vn" || /Zalo/i.test(navigator.userAgent);
}

export async function openZaloTradeContact(channel: TradeContactChannel, href: string) {
  try {
    const { openPhone, openWebview } = await import("zmp-sdk/apis");
    if (channel === "phone") await openPhone({ phoneNumber: href.slice(4) });
    else await openWebview({ url: href });
  } catch {
    window.location.assign(href);
  }
}
