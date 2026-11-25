import type { MembersPageProps } from "@/components/shared/page-props";
import { useState } from "react";
import type { Member } from "@/datas/types";
import MemberDirectory from "./member-directory";
import MembersHeader from "./members-header";
import MemberDetail from "./member-detail";

export default function Members({ data, onBack, scope = "all" }: MembersPageProps) {
  const [selected, setSelected] = useState<Member | null>(null);
  const isBoard = scope === "board";
  const title = isBoard ? "Ban chấp hành Hội" : "Danh sách hội viên";
  const members = isBoard ? data.members.filter((member) => member.isBoard) : data.members;

  return (
    <main className="members-page">
      <MembersHeader association={data.association} title={title} onBack={onBack} />
      <div className="members-directory-body">
        <h2 className="section-title members-directory-title">{title}</h2>
        {data.memberAccess === "required" ? (
          <p className="surface-card empty-state">Danh bạ dành cho hội viên đang hoạt động. Hệ thống tự nhận diện hồ sơ qua số điện thoại được Zalo xác minh.</p>
        ) : (
          <>
            <div className="members-directory-meta">
              <span>{members.length} {isBoard ? "thành viên" : "hội viên"}</span>
              {data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
            </div>
            <MemberDirectory members={members} showBoardRole={isBoard} onSelect={setSelected} />
          </>
        )}
      </div>
      {selected && <MemberDetail key={selected.id} member={selected} isDemo={data.isDemo} onClose={() => setSelected(null)} />}
    </main>
  );
}
