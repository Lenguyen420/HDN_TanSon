import { useState } from "react";
import PageToolbar from "@/components/shared/page-toolbar";
import type { UtilityPageProps } from "@/components/shared/page-props";
import FeePayment from "./fee-payment";
import FeeHistory from "./fee-history";

export default function Fees({ data, onBack }: UtilityPageProps) {
  const [tab, setTab] = useState<"payment" | "history">("payment");
  const [selectedId, setSelectedId] = useState("");
  return (
    <main className="fees-page fee-workspace">
      <PageToolbar title="Hội phí" onBack={onBack} />
      <div className="fee-tab-bar" role="group" aria-label="Chức năng hội phí"><button type="button" aria-pressed={tab === "payment"} className={tab === "payment" ? "is-active" : ""} onClick={() => setTab("payment")}>Đóng phí</button><button type="button" aria-pressed={tab === "history"} className={tab === "history" ? "is-active" : ""} onClick={() => setTab("history")}>Lịch sử</button></div>
      <div className="fee-workspace-body">
        {data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
        {tab === "payment" ? <FeePayment records={data.utilityPages.fees} selectedId={selectedId} onSelect={setSelectedId} /> : <FeeHistory records={data.utilityPages.fees} />}
      </div>
    </main>
  );
}
