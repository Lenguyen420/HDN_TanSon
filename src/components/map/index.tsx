import PageToolbar from "@/components/shared/page-toolbar";
import type { UtilityPageProps } from "@/components/shared/page-props";
import { mapNotice } from "@/datas/map";

export default function Map({ data, onBack }: UtilityPageProps) {
  const utility = data.utilities.find((item) => item.id === "ban-do");

  return (
    <main className="utility-page map-page">
      <PageToolbar title="Bản đồ" subtitle={data.association.slogan} onBack={onBack} />
      <div className="utility-page-body">
        <section className="surface-card map-notice" aria-labelledby="map-notice-title">
          {utility && <img src={utility.icon} alt="" width="96" height="96" />}
          <h2 id="map-notice-title">{mapNotice.title}</h2>
          <p>{mapNotice.message}</p>
          <p>{mapNotice.invitation}</p>
          <button type="button" className="primary-button" onClick={onBack}>Quay lại</button>
        </section>
      </div>
    </main>
  );
}
