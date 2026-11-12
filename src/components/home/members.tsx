import type { Member } from "@/datas/types";
import AppIcon from "@/components/icons";
import MemberPhoto from "@/components/shared/member-photo";
export default function HomeMembers({
  members,
  onViewAll,
}: {
  members: Member[];
  onViewAll: () => void;
}) {
  return (
    <section className="home-members" aria-labelledby="home-members-heading">
      <div className="section-heading">
        <h2 className="section-title" id="home-members-heading">
          Danh sách hội viên
        </h2>
        <button className="view-all" type="button" onClick={onViewAll}>
          Xem tất cả <AppIcon name="arrow" width="13" height="13" />
        </button>
      </div>
      <div className="home-member-list">
        {members.slice(0, 6).map((member) => (
          <article key={member.id} className="home-member-card">
            <MemberPhoto member={member} />
            <div>
              <h3>{member.name}</h3>
              <p>{member.company}</p>
              <span>{member.jobTitle || member.position}</span>
            </div>
          </article>
        ))}
      </div>
      {!members.length && (
        <p className="data-status">Danh sách hội viên đang được cập nhật.</p>
      )}
    </section>
  );
}
