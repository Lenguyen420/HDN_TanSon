import type { ContentArticle } from "@/datas/types";
import ArticleImage from "./article-image";
import { formatArticleDate } from "./content-card";
import AppIcon from "@/components/icons";

interface ContentListItemProps { article: ContentArticle; categoryTitle: string; onSelect: (article: ContentArticle) => void; }
export default function ContentListItem({ article, categoryTitle, onSelect }: ContentListItemProps) {
  const location = article.event?.venue || article.visit?.company;
  return (
    <button className="content-list-item" type="button" onClick={() => onSelect(article)}>
      <ArticleImage src={article.image} alt="" className="content-list-thumb" />
      <div className="content-list-item-copy">
        <span className="content-topic">{article.topic || categoryTitle}</span>
        <h3>{article.title}</h3>
        <div className="list-item-meta"><AppIcon name="calendar" /><time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time></div>
        {location && <div className="list-item-location"><AppIcon name="building" /><span>{location}</span></div>}
        <p>{article.summary}</p>
      </div>
      <AppIcon name="arrow" className="list-item-arrow" />
    </button>
  );
}
