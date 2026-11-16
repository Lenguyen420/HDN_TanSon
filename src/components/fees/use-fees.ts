import { useCallback, useEffect, useRef, useState } from "react";
import {
  getMyFees,
  getMyFee,
  submitFeeProof,
  type FeeDue,
  type FeeProof,
} from "@/services/membership-fees";
export default function useFees(enabled: boolean, initialDueId?: string) {
  const [rows, setRows] = useState<FeeDue[]>([]),
    [detail, setDetail] = useState<FeeDue>();
  const [loading, setLoading] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [tab, setTab] = useState<"dues" | "history">("dues");
  const generation = useRef(0),
    selected = useRef(""),
    lock = useRef(false);
  const refresh = useCallback(async () => {
    const current = ++generation.current;
    setLoading(true);
    setError("");
    try {
      const [all, one] = await Promise.all([
        getMyFees(),
        selected.current
          ? getMyFee(selected.current)
          : Promise.resolve(undefined),
      ]);
      if (generation.current === current) {
        setRows(all);
        setDetail(one);
      }
    } catch (e) {
      if (generation.current === current) {
        setRows([]);
        setDetail(undefined);
        setError(e instanceof Error ? e.message : "Chưa tải được hội phí.");
      }
    } finally {
      if (generation.current === current) setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    selected.current = initialDueId || "";
    setDetail(undefined);
    setNotice("");
    setTab("dues");
    void refresh();
    const wake = () => {
      if (document.visibilityState !== "hidden" && !lock.current)
        void refresh();
    };
    window.addEventListener("focus", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      generation.current++;
      window.removeEventListener("focus", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [enabled, refresh, initialDueId]);
  async function open(id: string) {
    selected.current = id;
    const current = ++generation.current;
    setLoading(true);
    setError("");
    setNotice("");
    setDetail(undefined);
    try {
      const result = await getMyFee(id);
      if (generation.current === current) setDetail(result);
    } catch (e) {
      if (generation.current === current)
        setError(e instanceof Error ? e.message : "Chưa tải được chi tiết.");
    } finally {
      if (generation.current === current) setLoading(false);
    }
  }
  function back() {
    selected.current = "";
    generation.current++;
    setDetail(undefined);
    setLoading(false);
    setError("");
    setNotice("");
  }
  async function submit(proof: FeeProof) {
    if (!detail || lock.current) return;
    lock.current = true;
    setBusy(true);
    setError("");
    setNotice("");
    const id = detail.id;
    try {
      await submitFeeProof(id, proof);
      setNotice(
        "Đã gửi thông tin chuyển khoản. Ban thư ký sẽ đối soát và xác nhận.",
      );
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chưa gửi được minh chứng.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return {
    rows,
    detail,
    loading,
    busy,
    error,
    notice,
    tab,
    setTab,
    refresh,
    open,
    back,
    submit,
  };
}
export type FeesController = ReturnType<typeof useFees>;
