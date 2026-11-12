import PageToolbar from "@/components/shared/page-toolbar";
export default function Policies({onBack}: {onBack: () => void}) { return <main><PageToolbar title="Điều khoản & chính sách" subtitle="Hội Doanh nghiệp Phường Tân Sơn" onBack={onBack}/><div className="personal-workspace-body"/></main>; }
