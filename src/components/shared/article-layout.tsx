import { useState, ReactNode } from "react";
import type { ContentCategory } from "@/datas/types";
import type { ArticlePageProps } from "./page-props";
import ArticleImage from "./article-image";
import ContentCard from "./content-card";
import { formatDate } from "./format";
import AppIcon from "@/components/icons";
import ContentCategories from "./content-categories";
import { contentCategories } from "@/datas/content-categories";
import PageToolbar from "./page-toolbar";

const savedKey = "tanson-saved-articles";
function savedArticles(): string[] {
  try { const value = JSON.parse(localStorage.getItem(savedKey) || "[]"); return Array.isArray(value) ? value.filter((id) => typeof id === "string") : []; } catch { return []; }
}

interface ArticleLayoutProps extends ArticlePageProps { category: ContentCategory; children?: ReactNode; }
export default function ArticleLayout({ data, article, category, onBack, onOpenArticle, onOpenContent, children }: ArticleLayoutProps) {
  const [saved, setSaved] = useState(() => savedArticles().includes(article.id));
  const [status, setStatus] = useState("");
  const collection = data.content[category];
  const related = collection.articles.filter((item) => item.id !== article.id);
  return (
    <main className={`article-page ${category}-detail-page`}>
      <PageToolbar title={contentCategories.find((item) => item.id === category)?.detailTitle || "Chi tiết bài viết"} onBack={onBack} headingLevel="h2" sticky />
      <figure className="article-cover"><ArticleImage src={article.image} alt={article.title} /></figure>
      <article className="article-body">
        <div className="article-topline"><span className="article-category">{collection.title}</span>{data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}</div>
        <h1>{article.title}</h1>
        <div className="article-meta"><span><AppIcon name="user" />{article.author || "Ban thư ký Hội"}</span><time dateTime={article.publishedAt}><AppIcon name="calendar" />{formatDate(article.publishedAt)}</time></div>
        <p className="article-lead">{article.summary}</p>
        {children}
        <div className="article-prose">{article.paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <div className="article-actions"><button type="button" className={`save-article ${saved ? "is-saved" : ""}`} aria-pressed={saved} onClick={() => {
          const ids = savedArticles();
          const next = !saved;
          try { localStorage.setItem(savedKey, JSON.stringify(next ? Array.from(new Set([...ids, article.id])) : ids.filter((id) => id !== article.id))); setSaved(next); setStatus(next ? "Đã lưu bài viết trên thiết bị." : "Đã bỏ lưu bài viết."); } catch { setStatus("Không thể lưu bài viết trên thiết bị."); }
        }}><AppIcon name={saved ? "check" : "register"} />{saved ? "Đã lưu bài viết" : "Lưu bài viết"}</button><span>{data.association.slogan}</span></div>
        {status && <p className="form-status" role="status">{status}</p>}
      </article>
      <section className="article-discover"><h2 className="utility-section-title">Khám phá danh mục</h2><ContentCategories value={category} onChange={onOpenContent} /></section>
      {related.length > 0 && <section className="related-section"><h2 className="utility-section-title">{category === "events" ? "Sự kiện khác" : "Bài viết liên quan"}</h2><div className="content-carousel">{related.map((item) => <ContentCard key={item.id} article={item} onSelect={(selected) => onOpenArticle(category, selected.id)} />)}</div></section>}
    </main>
  );
}
