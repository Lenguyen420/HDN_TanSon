import { useEffect, useState } from "react";
import { getRegistrationUpdates } from "@/services/registration-notifications";
import type { Notification, RegistrationProfile } from "@/datas/types";
export default function useRegistrationNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState("");
  const [profiles, setProfiles] = useState<RegistrationProfile[]>([]);
  useEffect(() => {
    let active = true, busy = false, repeat = false;
    const refresh = async () => {
      if (document.visibilityState === "hidden") return;
      if (busy) { repeat = true; return; }
      busy = true;
      try { const result = await getRegistrationUpdates(); if (active) { setNotifications(result.data); setProfiles(result.profiles); setError(""); } }
      catch { if (active) setError("Chưa cập nhật được kết quả đăng ký. Ứng dụng sẽ tự thử lại."); }
      finally { busy = false; if (active && repeat) { repeat = false; void refresh(); } }
    };
    void refresh();
    const timer = window.setInterval(() => { void refresh(); }, 5000);
    const wake = () => { void refresh(); };
    window.addEventListener("focus", wake);
    window.addEventListener("storage", wake);
    window.addEventListener("tanson-registration-updated", wake);
    document.addEventListener("visibilitychange", wake);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", wake); window.removeEventListener("storage", wake); window.removeEventListener("tanson-registration-updated", wake); document.removeEventListener("visibilitychange", wake); };
  }, []);
  return { notifications, profiles, error };
}
