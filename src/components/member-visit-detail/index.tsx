import ArticleLayout from "@/components/shared/article-layout";
import type { ArticlePageProps } from "@/components/shared/page-props";
import { formatDate } from "@/components/shared/format";
import AppIcon from "@/components/icons";

export default function MemberVisitDetail(props: ArticlePageProps) {
  const visit = props.article.visit;
  return (
    <ArticleLayout {...props} category="member-visits">
      {visit && <section className="visit-business-panel"><span className="record-icon"><AppIcon name="building" /></span><span className="overline">DOANH NGHIỆP ĐƯỢC THĂM</span><h2>{visit.company}</h2><dl><div><dt>Đại diện</dt><dd>{visit.representative}</dd></div><div><dt>Lĩnh vực</dt><dd>{visit.field}</dd></div><div><dt>Ngày thăm</dt><dd>{formatDate(visit.date)}</dd></div><div><dt>Địa chỉ</dt><dd>{visit.address}</dd></div></dl><p className="form-note">Hồ sơ và thông tin chuyến thăm minh họa.</p></section>}
    </ArticleLayout>
  );
}
