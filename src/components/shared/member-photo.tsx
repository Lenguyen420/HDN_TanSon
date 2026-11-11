import type { Member } from "@/datas/types";

export default function MemberPhoto({ member }: { member: Member }) {
  return (
    <span className="directory-photo" aria-hidden="true">
      <span>{member.initials}</span>
      {member.avatar && <img key={member.avatar} src={member.avatar} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
    </span>
  );
}
