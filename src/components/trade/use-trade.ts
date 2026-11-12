import { useEffect, useState } from "react";
import { tradeRequest } from "@/services/trade";
import type { TradeMeta } from "@/services/trade-types";
export function useTradeList<T>(path: string, required = false, poll = 0) {
  const [data, setData] = useState<T[]>([]),
    [meta, setMeta] = useState<TradeMeta>(),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [revision, setRevision] = useState(0);
  useEffect(() => {
    let cancelled = false,
      first = true;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (poll && !cancelled) timer = setTimeout(() => void load(), poll);
    };
    const load = async () => {
      if (cancelled) return;
      if (!first && document.hidden) {
        schedule();
        return;
      }
      if (first) setLoading(true);
      try {
        const result = await tradeRequest<T[]>(
          path,
          "GET",
          undefined,
          required,
        );
        if (!cancelled) {
          setData(result.data);
          setMeta(result.meta);
          setError("");
        }
      } catch (e) {
        if (!cancelled)
          setError(e instanceof Error ? e.message : "Không tải được dữ liệu.");
      } finally {
        first = false;
        if (!cancelled) setLoading(false);
        schedule();
      }
    };
    void load();
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [path, required, revision, poll]);
  return {
    data,
    meta,
    error,
    loading,
    refresh: () => setRevision((v) => v + 1),
  };
}
export function useTradeAction() {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  return {
    busy,
    error,
    run: async (action: () => Promise<void>) => {
      setBusy(true);
      setError("");
      try {
        await action();
        return true;
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Không thực hiện được thao tác.",
        );
        return false;
      } finally {
        setBusy(false);
      }
    },
  };
}
