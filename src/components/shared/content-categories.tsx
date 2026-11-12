import { contentCategories } from "@/datas/content-categories";
import type { ContentCategory } from "@/datas/types";
import AppIcon from "@/components/icons";

interface ContentCategoriesProps<T extends string> {
  value: T;
  onChange: (category: T) => void;
  items?: { id: T; title: string; icon?: import("@/components/icons").IconName }[];
}

export default function ContentCategories<T extends string = ContentCategory>({ value, onChange, items }: ContentCategoriesProps<T>) {
  const categories = items || contentCategories as unknown as { id: T; title: string; icon?: import("@/components/icons").IconName }[];
  return (
    <nav className="content-categories" aria-label="Chọn nhanh danh mục">
      {categories.map((category) => (
        <button key={category.id} type="button" aria-pressed={value === category.id} className={value === category.id ? "is-selected" : ""} onClick={() => onChange(category.id)}>
          {category.icon && <AppIcon name={category.icon} />}<span>{category.title}</span>
        </button>
      ))}
    </nav>
  );
}
