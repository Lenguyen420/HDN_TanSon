import type { Member } from "@/datas/types";
import { resolveApiImage } from "@/services/api";

export default function MemberPhoto({ member }: { member: Member }) {
  const source = /^\/?uploads\//.test(member.avatar || "") ? resolveApiImage(member.avatar) : member.avatar;
  const initials = member.initials || member.name.trim().split(/\s+/).slice(-2).map((part) => part[0]).join("");
  return (
    <span className="directory-photo" aria-hidden="true">
      <span>{initials}</span>
      {source && <img key={source} src={source} alt="" loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
    </span>
  );
}
