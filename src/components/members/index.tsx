import type { MembersPageProps } from "@/components/shared/page-props";
import { useState } from "react";
import type { Member } from "@/datas/types";
import MemberDirectory from "./member-directory";
import MembersHeader from "./members-header";
import MemberDetail from "./member-detail";

export default function Members({ data, onBack }: MembersPageProps) {
  const [selected, setSelected] = useState<Member | null>(null);
  return (
    <main className="members-page">
      <MembersHeader association={data.association} onBack={onBack} />
      <div className="members-directory-body">
        {data.memberAccess === "required" ? <p className="surface-card empty-state">Danh bạ dành cho hội viên đang hoạt động. Hệ thống tự nhận diện hồ sơ qua số điện thoại được Zalo xác minh.</p> : <>
        <div className="members-directory-meta"><span>{data.members.length} hội viên</span>{data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}</div>
        <MemberDirectory members={data.members} onSelect={setSelected} />
        </>}
      </div>
      {selected && <MemberDetail key={selected.id} member={selected} isDemo={data.isDemo} onClose={() => setSelected(null)} />}
    </main>
  );
}
