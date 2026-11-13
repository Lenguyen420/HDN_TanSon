import { useEffect, useState } from "react";
import { getNotifications } from "@/services/content";
import { useMockData } from "@/services/api";
import type { Notification } from "@/datas/types";

export default function usePublicNotifications() {
  const [notifications, setNotifications] = useState<Notification[] | null>(
    null,
  );
  const [error, setError] = useState("");
  useEffect(() => {
    if (useMockData) return;
    let active = true,
      busy = false;
    const refresh = async () => {
      if (document.visibilityState === "hidden" || busy) return;
      busy = true;
      try {
        const data = await getNotifications();
        if (active) {
          setNotifications(data);
          setError("");
        }
      } catch {
        if (active)
          setError(
            "Chưa cập nhật được thông báo từ Hội. Ứng dụng sẽ tự thử lại.",
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
    window.addEventListener("focus", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, []);
  return { notifications, error };
}
