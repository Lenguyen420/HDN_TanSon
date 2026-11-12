import { useEffect, useState } from "react";
import { getEventUpdates, type EventParticipation } from "@/services/event-workspace";
import type { Notification } from "@/datas/types";
export default function useEventUpdates() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [participations, setParticipations] = useState<EventParticipation[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let active = true, busy = false, repeat = false;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      if (busy) { repeat = true; return; }
      busy = true;
      try { const result = await getEventUpdates(); if (active) { setNotifications(result.data); setParticipations(result.participations); setError(""); } }
      catch { if (active) setError("Chưa cập nhật được đăng ký và thông báo sự kiện. Ứng dụng sẽ tự thử lại."); }
      finally { busy = false; if (active) { setLoading(false); if (repeat) { repeat = false; void refresh(); } } }
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    const wake = () => { void refresh(); };
    window.addEventListener("focus", wake); window.addEventListener("storage", wake); window.addEventListener("tanson-event-updated", wake); document.addEventListener("visibilitychange", wake);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", wake); window.removeEventListener("storage", wake); window.removeEventListener("tanson-event-updated", wake); document.removeEventListener("visibilitychange", wake); };
  }, []);
  return { notifications, participations, setParticipations, loading, error };
}
