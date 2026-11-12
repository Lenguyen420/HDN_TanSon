import type { Utility } from "@/datas/types";

export default function Utilities({ utilities, onSelect }: { utilities: Utility[]; onSelect: (index: number) => void }) {
  return (
    <section className="utilities-section">
      <h2 className="section-title">Tiện ích</h2>
      <div className="utilities-grid">
        {utilities.map((item, index) => (
          <button type="button" className="utility" key={item.id} disabled={item.comingSoon} onClick={() => onSelect(index)}>
            <span className={`utility-icon${item.id === "giao-thuong" ? " utility-icon--giao-thuong" : ""}`}>
              <img src={item.icon} alt="" width="80" height="80" draggable={false} />
            </span>
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
