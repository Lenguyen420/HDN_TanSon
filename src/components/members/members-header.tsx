import type { Association } from "@/datas/types";
import BackButton from "@/components/shared/back-button";

export default function MembersHeader({ association, onBack }: { association: Association; onBack: () => void }) {
  return (
    <header className="members-header">
      <div className="members-back"><BackButton onBack={onBack} /></div>
      <h1>{association.name}<br />{association.locality}</h1>
      <p>{association.memberSlogan || association.slogan}</p>
      <div className="members-association-logo"><img src={association.logo} alt={`Logo ${association.name} ${association.locality}`} width="480" height="480" loading="eager" /></div>
    </header>
  );
}
