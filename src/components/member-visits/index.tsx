import ContentList from "@/components/shared/content-list";
import type { ContentListPageProps } from "@/components/shared/page-props";

export default function MemberVisits({ data, onBack, onOpenArticle, onChangeCategory }: ContentListPageProps) {
  return (
    <main className="member-visits-page">
      <ContentList collection={data.content["member-visits"]} association={data.association} isDemo={data.isDemo} onBack={onBack} category="member-visits" onChangeCategory={onChangeCategory} onSelect={(article) => onOpenArticle("member-visits", article.id)} />
    </main>
  );
}
