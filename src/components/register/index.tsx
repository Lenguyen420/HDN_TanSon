import type { TabPageProps } from "@/components/shared/page-props";
import { pageContent } from "@/datas/pages";
import PageHeader from "@/components/shared/page-header";
import RegistrationForm from "./registration-form";

export default function Register({ data, onBack }: TabPageProps) {
  const content = pageContent.register;
  return (
    <main className="register-page">
      <PageHeader association={data.association} title={content.title} subtitle={content.subtitle} onBack={onBack} />
      <section className="member-registration-card" aria-label="Thông tin đăng kí hội viên">
        <RegistrationForm registration={data.registration} />
      </section>
    </main>
  );
}
