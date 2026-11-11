import type { ReactNode } from "react";
import type { AppData, UtilityId } from "@/datas/types";
import PageHeader from "./page-header";

interface UtilityLayoutProps { data: AppData; id: UtilityId; subtitle: string; onBack: () => void; children: ReactNode; }
export default function UtilityLayout({ data, id, subtitle, onBack, children }: UtilityLayoutProps) {
  const utility = data.utilities.find((item) => item.id === id);
  return (
    <main className={`utility-page ${id}-page`}>
      <PageHeader association={data.association} title={utility?.title || "Tiện ích"} subtitle={subtitle} onBack={onBack} />
      <div className="utility-page-body">
        {data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
        {children}
      </div>
    </main>
  );
}
