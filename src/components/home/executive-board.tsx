import AppIcon from "../icons";
import MemberPhoto from "@/components/shared/member-photo";
import type { Member } from "@/datas/types";

interface ExecutiveBoardProps {
  members: Member[];
  isDemo: boolean;
  onViewAll: () => void;
  accessRequired?: boolean;
}

export default function ExecutiveBoard({ members, isDemo, onViewAll, accessRequired }: ExecutiveBoardProps) {
  return (
    <section className="board-section">
      <div className="section-heading">
        <h2 className="section-title">Ban chấp hành hội</h2>
        <button className="view-all" type="button" onClick={onViewAll}>Tất cả <AppIcon name="arrow" width="13" height="13" /></button>
      </div>
      {isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
      <div className="board-list">
        {members.map((member) => (
          <article className="board-member" key={member.id}>
            <div className="member-avatar"><MemberPhoto member={member} /></div>
            <span className="board-position">{member.position}</span>
            <h3>{member.name}</h3>
            <p>{member.company}</p>
          </article>
        ))}
        {members.length === 0 && <p className="data-status">{accessRequired ? "Xác thực hội viên để xem thông tin Ban chấp hành." : "Thông tin Ban chấp hành đang được cập nhật."}</p>}
      </div>
    </section>
  );
}
