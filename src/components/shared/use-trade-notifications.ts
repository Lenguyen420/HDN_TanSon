import { useEffect, useState } from "react";
import { currentTradeUser, tradeRequest } from "@/services/trade";
import { registrationTokens } from "@/services/registration-notifications";
import { tradeNoticeLabels, type TradeNotice } from "@/services/trade-types";
import type { Notification } from "@/datas/types";
export default function useTradeNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]),
    [error, setError] = useState("");
  useEffect(() => {
    let active = true,
      busy = false;
    const refresh = async () => {
      if (busy || document.visibilityState === "hidden") return;
      if (!currentTradeUser() && !registrationTokens().length) return;
      busy = true;
      try {
        const result = await tradeRequest<TradeNotice[]>(
          "trade-notifications?limit=100",
          "GET",
          undefined,
          true,
        );
        if (active) {
          setNotifications(
            result.data
              .filter((n) => n.type !== "TRADE_POST_NEW")
              .map((n) => {
                const date = new Intl.DateTimeFormat("sv-SE", {
                  timeZone: "Asia/Ho_Chi_Minh",
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                }).format(new Date(n.createdAt));
                const time = new Intl.DateTimeFormat("en-GB", {
                  timeZone: "Asia/Ho_Chi_Minh",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(n.createdAt));
                return {
                  id: "trade-private-" + n.id,
                  title: tradeNoticeLabels[n.type] || "Cập nhật giao thương",
                  description: n.title + (n.reason ? " · " + n.reason : ""),
                  paragraphs: [n.title],
                  date,
                  time,
                  createdAt: n.createdAt,
                  category: "Giao thương",
                  scope: "private" as const,
                  source: "trade" as const,
                  unread: !n.read,
                  tradePostId: n.tradePostId,
                  tradeNoticeId: n.id,
                  tradeCommentId: n.commentId,
                  tradeManaged:
                    !n.type.startsWith("TRADE_COMMENT_") &&
                    !n.type.startsWith("TRADE_REVIEW_"),
                };
              }),
          );
          setError("");
        }
      } catch {
        if (active)
          setError(
            "Chưa cập nhật được thông báo giao thương. Ứng dụng sẽ tự thử lại.",
          );
      } finally {
        busy = false;
      }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 15000);
    const wake = () => {
      void refresh();
    };
    window.addEventListener("tanson-trade-auth", wake);
    window.addEventListener("tanson-registration-updated", wake);
    window.addEventListener("focus", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("tanson-trade-auth", wake);
      window.removeEventListener("tanson-registration-updated", wake);
      window.removeEventListener("focus", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);
  return { notifications, error };
}
