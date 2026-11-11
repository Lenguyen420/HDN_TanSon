import News from "@/components/news";
import type { ContentListPageProps } from "@/components/shared/page-props";

export default function NewsPage(props: ContentListPageProps) {
  return <News {...props} />;
}
