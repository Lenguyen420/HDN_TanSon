import { contentCategories } from "@/datas/content-categories";
import type { ContentCategory } from "@/datas/types";
import AppIcon from "@/components/icons";

interface ContentCategoriesProps {
  value: ContentCategory;
  onChange: (category: ContentCategory) => void;
}

export default function ContentCategories({ value, onChange }: ContentCategoriesProps) {
  return (
    <nav className="content-categories" aria-label="Chọn nhanh danh mục">
      {contentCategories.map((category) => (
        <button key={category.id} type="button" aria-pressed={value === category.id} className={value === category.id ? "is-selected" : ""} onClick={() => onChange(category.id)}>
          <AppIcon name={category.icon} /><span>{category.title}</span>
        </button>
      ))}
    </nav>
  );
}
