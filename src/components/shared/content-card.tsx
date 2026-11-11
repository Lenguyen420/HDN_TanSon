import placeholder from "@/assets/placeholder/article.svg";
import type { ContentArticle } from "@/datas/types";

export function formatArticleDate(value: string) {
  const date = new Date(`${value}T00:00:00+07:00`);
  if (Number.isNaN(date.getTime())) return value;
  const label = value.split("-").reverse().join("-");
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  const relative = days < 0 ? "Sắp tới" : days === 0 ? "Hôm nay" : days < 30 ? `${days} ngày trước` : days < 365 ? `${Math.floor(days / 30)} tháng trước` : `${Math.floor(days / 365)} năm trước`;
  return `${label} · ${relative}`;
}

export default function ContentCard({ article, onSelect }: { article: ContentArticle; onSelect: (article: ContentArticle) => void }) {
  return (
    <button type="button" className="content-card" onClick={() => onSelect(article)}>
      <img className="content-card-image" src={article.image || placeholder} alt="" loading="lazy" onError={(event) => { if (event.currentTarget.getAttribute("src") !== placeholder) event.currentTarget.src = placeholder; }} />
      <div className="content-card-body">
        <h3>{article.title}</h3>
        <div className="content-card-date">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 6v6l4 2" /></svg>
          <time dateTime={article.publishedAt}>{formatArticleDate(article.publishedAt)}</time>
        </div>
      </div>
    </button>
  );
}
