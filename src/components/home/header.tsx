import type { Association } from "@/datas/types";

export default function HomeHeader({ association }: { association: Association }) {
  return (
    <header className="home-header">
      <img className="association-logo" src={association.logo} alt={`Logo ${association.name} ${association.locality}`} width="480" height="480" loading="eager" decoding="sync" />
      <div className="header-copy">
        <p className="header-eyebrow">{association.slogan}</p>
        <h1>{association.name}<br />{association.locality}</h1>
        <p className="header-greeting">{association.greeting}</p>
      </div>
    </header>
  );
}
