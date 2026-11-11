import { useState } from "react";
import PageToolbar from "./page-toolbar";
import ContentListItem from "./content-list-item";
import ContentCategories from "./content-categories";
import FilterChips from "./filter-chips";
import type { Association, ContentArticle, ContentCategory, ContentCollection } from "@/datas/types";

interface ContentListProps {
  collection: ContentCollection;
  association: Association;
  isDemo: boolean;
  onBack: () => void;
  onSelect: (article: ContentArticle) => void;
  category: ContentCategory;
  onChangeCategory: (category: ContentCategory) => void;
}

export default function ContentList({ collection, isDemo, onBack, onSelect, category, onChangeCategory }: ContentListProps) {
  const [topic, setTopic] = useState("all");
  const topics = Array.from(new Set(collection.articles.map((article) => article.topic).filter((value): value is string => Boolean(value))));
  const visible = collection.articles.filter((article) => topic === "all" || article.topic === topic);
  return (
    <>
      <PageToolbar title={collection.title} onBack={onBack} />
      <div className="content-directory-body">
        <div className="content-directory-controls">
          <ContentCategories value={category} onChange={onChangeCategory} />
          <div className="directory-filters"><FilterChips label="Lọc chủ đề" value={topic} onChange={setTopic} options={[{ value: "all", label: "Tất cả" }, ...topics.map((value) => ({ value, label: value }))]} /></div>
        </div>
        <div className="directory-result-line"><span>{visible.length} bài viết</span>{isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}</div>
        <div className="content-directory-list" aria-live="polite">
          {visible.map((article) => <ContentListItem key={article.id} article={article} categoryTitle={collection.title} onSelect={onSelect} />)}
        </div>
        {visible.length === 0 && <p className="surface-card empty-state">Nội dung đang được cập nhật.</p>}
      </div>
    </>
  );
}
