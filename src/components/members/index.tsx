import type { TabPageProps } from "@/components/shared/page-props";
import { useState } from "react";
import type { Member } from "@/datas/types";
import MemberDirectory from "./member-directory";
import MembersHeader from "./members-header";
import MemberDetail from "./member-detail";

export default function Members({ data, onBack }: TabPageProps) {
  const [selected, setSelected] = useState<Member | null>(null);
  return (
    <main className="members-page">
      <MembersHeader association={data.association} onBack={onBack} />
      <div className="members-directory-body">
        <div className="members-directory-meta"><span>{data.members.length} hội viên</span>{data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}</div>
        <MemberDirectory members={data.members} onSelect={setSelected} />
      </div>
      {selected && <MemberDetail key={selected.id} member={selected} isDemo={data.isDemo} onClose={() => setSelected(null)} />}
    </main>
  );
}
