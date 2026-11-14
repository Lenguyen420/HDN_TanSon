import ContentListItem from "@/components/shared/content-list-item";
import { resolveApiImage } from "@/services/api";
import type { LocalGoPlace, LocalGoCategory } from "@/services/localgo";
export default function PlaceCard({
  place,
  categories,
  onSelect,
  managed = false,
}: {
  place: LocalGoPlace;
  categories: LocalGoCategory[];
  onSelect: () => void;
  managed?: boolean;
}) {
  const category =
    categories.find((item) => item.code === place.category)?.name ||
    place.category;
  return (
    <div className="localgo-card">
      {managed && (
        <span
          className={`localgo-status ${place.isVisible ? "is-visible" : ""}`}
        >
          {place.isVisible ? "Đang hiển thị" : "Đã ẩn"}
        </span>
      )}
      <ContentListItem
        article={{
          id: place.id,
          title: place.name,
          topic: category,
          image: resolveApiImage(place.coverImage),
          publishedAt: place.publishedAt.slice(0, 10),
          summary: place.description,
          paragraphs: [],
          visit: {
            company: place.address,
            address: place.address,
            representative: "",
            date: "",
            field: "",
          },
        }}
        categoryTitle={category}
        onSelect={onSelect}
      />
    </div>
  );
}
