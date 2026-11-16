import { useEffect, useState } from "react";
import {
  getPartner,
  getPartners,
  type Partner,
  type PartnerSummary,
} from "@/services/partners";
export default function usePartners(
  active: boolean,
  partnerId?: string,
  contributionId?: string,
) {
  const [search, setSearch] = useState(""),
    [sort, setSort] = useState("amount"),
    [page, setPage] = useState(1),
    [historyPage, setHistoryPage] = useState(1);
  const [rows, setRows] = useState<Partner[]>([]),
    [detail, setDetail] = useState<Partner>(),
    [summary, setSummary] = useState<PartnerSummary>();
  const [total, setTotal] = useState(0),
    [historyTotal, setHistoryTotal] = useState(0),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = true,
      busy = false;
    setDetail(undefined);
    setError("");
    setLoading(true);
    async function refresh() {
      if (busy) return;
      busy = true;
      try {
        if (partnerId) {
          const r = await getPartner(partnerId, historyPage, contributionId);
          if (current) {
            setDetail(r.data);
            setHistoryTotal(r.pagination.total);
          }
        } else {
          const r = await getPartners(search, sort, page);
          if (current) {
            setRows(r.data);
            setTotal(r.pagination.total);
            setSummary(r.summary);
          }
        }
        if (current) setError("");
      } catch (e) {
        if (current) {
          setError(
            e instanceof Error ? e.message : "Không tải được đơn vị đồng hành.",
          );
          setDetail(undefined);
          setRows([]);
          setSummary(undefined);
        }
      } finally {
        busy = false;
        if (current) setLoading(false);
      }
    }
    const initial = window.setTimeout(() => void refresh(), 250);
    const wake = () => {
      if (document.visibilityState !== "hidden") void refresh();
    };
    const timer = window.setInterval(wake, 15000);
    window.addEventListener("focus", wake);
    document.addEventListener("visibilitychange", wake);
    return () => {
      current = false;
      window.clearTimeout(initial);
      window.clearInterval(timer);
      window.removeEventListener("focus", wake);
      document.removeEventListener("visibilitychange", wake);
    };
  }, [
    active,
    partnerId,
    contributionId,
    search,
    sort,
    page,
    historyPage,
    attempt,
  ]);
  return {
    rows,
    detail,
    summary,
    total,
    historyTotal,
    loading,
    error,
    search,
    sort,
    page,
    historyPage,
    setSearch: (v: string) => {
      setSearch(v);
      setPage(1);
    },
    setSort: (v: string) => {
      setSort(v);
      setPage(1);
    },
    setPage,
    setHistoryPage,
    retry: () => setAttempt((n) => n + 1),
  };
}
export type PartnersController = ReturnType<typeof usePartners>;
