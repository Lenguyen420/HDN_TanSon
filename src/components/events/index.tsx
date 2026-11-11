import ContentList from "@/components/shared/content-list";
import type { ContentListPageProps } from "@/components/shared/page-props";

export default function Events({ data, onBack, onOpenArticle, onChangeCategory }: ContentListPageProps) {
  return (
    <main className="events-page">
      <ContentList collection={data.content["events"]} association={data.association} isDemo={data.isDemo} onBack={onBack} category="events" onChangeCategory={onChangeCategory} onSelect={(article) => onOpenArticle("events", article.id)} />
    </main>
  );
}
