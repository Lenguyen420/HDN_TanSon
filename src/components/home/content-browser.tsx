import ContentCategories from "@/components/shared/content-categories";
import ContentListItem from "@/components/shared/content-list-item";
import AppIcon from "@/components/icons";
import type { AppData, ContentCategory } from "@/datas/types";

interface ContentBrowserProps {
  data: AppData;
  category: ContentCategory;
  onChangeCategory: (category: ContentCategory) => void;
  onOpenContent: (category: ContentCategory) => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
}

export default function ContentBrowser({ data, category, onChangeCategory, onOpenContent, onOpenArticle }: ContentBrowserProps) {
  const collection = data.content[category];
  return (
    <section className="home-content-browser" aria-label="Khám phá hoạt động">
      <div className="browser-heading"><span className="overline">{data.association.slogan}</span><h2>Khám phá hoạt động</h2></div>
      <ContentCategories value={category} onChange={onChangeCategory} />
      <section aria-label={collection.title}>
        <div className="home-directory-heading"><h2>{collection.title}</h2><button type="button" className="text-button-inline" aria-label={`Tất cả ${collection.title.toLowerCase()}`} onClick={() => onOpenContent(category)}>Tất cả <AppIcon name="arrow" /></button></div>
        <div className="content-directory-list" aria-live="polite">
          {collection.articles.slice(0, 3).map((article) => <ContentListItem key={article.id} article={article} categoryTitle={collection.title} onSelect={(selected) => onOpenArticle(category, selected.id)} />)}
        </div>
        {collection.articles.length === 0 && <p className="surface-card empty-state">Nội dung đang được cập nhật.</p>}
      </section>
    </section>
  );
}
