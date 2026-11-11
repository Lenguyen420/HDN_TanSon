import AppIcon from "../icons";
import type { Association } from "@/datas/types";

export default function FollowCard({ association, onFollow }: { association: Association; onFollow: () => void }) {
  return (
    <section className="follow-card">
      <div>
        <span className="follow-tag">ZALO OFFICIAL ACCOUNT</span>
        <h2>OA {association.name}<br />{association.locality}</h2>
        <p>{association.oaDescription}</p>
      </div>
      <button className="follow-button" type="button" onClick={onFollow}>
        Quan tâm <AppIcon name="arrow" width="15" height="15" />
      </button>
    </section>
  );
}
