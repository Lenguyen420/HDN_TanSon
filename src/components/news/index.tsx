import ContentList from "@/components/shared/content-list";
import type { ContentListPageProps } from "@/components/shared/page-props";

export default function News({ data, onBack, onOpenArticle, onChangeCategory }: ContentListPageProps) {
  return (
    <main className="news-page">
      <ContentList collection={data.content["news"]} association={data.association} isDemo={data.isDemo} onBack={onBack} category="news" onChangeCategory={onChangeCategory} onSelect={(article) => onOpenArticle("news", article.id)} />
    </main>
  );
}
