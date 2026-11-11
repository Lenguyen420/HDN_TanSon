import type { Member } from "@/datas/types";
import MemberPhoto from "@/components/shared/member-photo";
import AppIcon from "@/components/icons";

export default function MemberDirectory({ members, onSelect }: { members: Member[]; onSelect: (member: Member) => void }) {
  return (
    <div className="member-cards">
      {members.map((member) => (
        <button className="member-directory-card" key={member.id} type="button" aria-label={`Xem thông tin ${member.name}`} onClick={() => onSelect(member)}>
          <MemberPhoto member={member} />
          <div className="member-directory-copy">
            <h3>{member.name}</h3>
            <span className="member-job-title">{member.jobTitle || member.position}</span>
            <p>{member.company}</p>
            {member.phone && <span className="member-phone-pill"><AppIcon name="phone" />{member.phone}</span>}
          </div>
          <span className="member-directory-arrow"><AppIcon name="arrow" /></span>
        </button>
      ))}
      {members.length === 0 && <p className="surface-card empty-state">Chưa có thông tin hội viên.</p>}
    </div>
  );
}
