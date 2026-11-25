import banner from "@/assets/banner/banner5.jpg";
import PageToolbar from "@/components/shared/page-toolbar";
import type { Association } from "@/datas/types";

export default function MembersHeader({ association, onBack }: { association: Association; onBack: () => void }) {
  return (
    <PageToolbar
      title="Hội viên"
      onBack={onBack}
      banner={{ src: banner, alt: 'Đại hội thành lập ' + association.name + ' ' + association.locality, width: 2048, height: 1366 }}
    />
  );
}
