import banner from "@/assets/banner/banner5.jpg";
import PageToolbar from "@/components/shared/page-toolbar";
import type { Association } from "@/datas/types";

export default function MembersHeader({ association, title, onBack }: { association: Association; title: string; onBack: () => void }) {
  return (
    <>
      <PageToolbar
        title={title}
        onBack={onBack}
        banner={{
          src: banner,
          alt: `Đại hội thành lập ${association.name} ${association.locality}`,
          width: 2048,
          height: 1366,
        }}
      />
      <div className="members-brand">
        <img
          className="association-logo"
          src={association.logo}
          alt={`Logo ${association.name} ${association.locality}`}
          width="480"
          height="480"
        />
        <p>{association.slogan}</p>
      </div>
    </>
  );
}
