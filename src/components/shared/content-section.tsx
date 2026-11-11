import AppIcon from "@/components/icons";
import ContentCard from "./content-card";
import type { ContentArticle, ContentCollection } from "@/datas/types";

interface ContentSectionProps {
  collection: ContentCollection;
  onViewAll: () => void;
  onSelect: (article: ContentArticle) => void;
}

export default function ContentSection({ collection, onViewAll, onSelect }: ContentSectionProps) {
  return (
    <section className="content-section" aria-label={collection.title}>
      <div className="section-heading">
        <h2 className="section-title">{collection.title}</h2>
        <button type="button" className="view-all" onClick={onViewAll} aria-label={`Tất cả ${collection.title.toLowerCase()}`}>Tất cả <AppIcon name="arrow" width="13" height="13" /></button>
      </div>
      <div className="content-carousel">
        {collection.articles.slice(0, 5).map((article) => <ContentCard key={article.id} article={article} onSelect={onSelect} />)}
        {collection.articles.length === 0 && <p className="content-empty">Nội dung đang được cập nhật.</p>}
      </div>
    </section>
  );
}
