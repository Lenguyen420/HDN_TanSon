import UtilityLayout from "@/components/shared/utility-layout";
import type { UtilityPageProps } from "@/components/shared/page-props";
import AppIcon from "@/components/icons";
import { introductionParagraphs } from "./introduction-paragraphs";
import IntroductionVideo from "./introduction-video";

export default function About({ data, onBack }: UtilityPageProps) {
  const about = data.utilityPages.about;
  return (
    <UtilityLayout data={data} id="about" subtitle={data.association.slogan} onBack={onBack}>
      <section className="surface-card about-intro">
        <img src={data.association.logo} alt="Logo Hội Doanh nghiệp Phường Tân Sơn" />
        <span className="overline">{data.association.slogan}</span>
        <h2>{data.association.name}<br />{data.association.locality}</h2>
        <IntroductionVideo key={about.introductionVideoUrl} url={about.introductionVideoUrl} />
        <div className="about-introduction">
          {introductionParagraphs(about.introduction).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        </div>
        <div className="about-stats"><div><strong>{data.memberAccess === "required" ? "—" : data.members.length}</strong><span>{data.isDemo ? "Hội viên mẫu" : "Hội viên"}</span></div><div><strong>{data.memberAccess === "required" ? "—" : data.members.filter((member) => member.isBoard).length}</strong><span>Ban chấp hành</span></div><div><strong>{data.content.events.articles.length}</strong><span>{data.isDemo ? "Sự kiện mẫu" : "Sự kiện"}</span></div></div>
      </section>
      <section className="surface-card mission-card"><AppIcon name="handshake" /><h2>Sứ mệnh của Hội</h2><p>{about.mission}</p></section>
      <h2 className="utility-section-title">Giá trị kết nối</h2>
      <div className="value-list">{about.values.map((value, index) => <article className="surface-card value-card" key={value.title}><span>0{index + 1}</span><div><h3>{value.title}</h3><p>{value.description}</p></div></article>)}</div>
      <section className="surface-card"><h2>Hoạt động trọng tâm</h2><div className="topic-tags">{about.fields.map((field) => <span key={field}>{field}</span>)}</div></section>
    </UtilityLayout>
  );
}
