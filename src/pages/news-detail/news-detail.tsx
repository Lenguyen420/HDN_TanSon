import NewsDetail from "@/components/news-detail";
import type { ArticlePageProps } from "@/components/shared/page-props";

export default function NewsDetailPage(props: ArticlePageProps) {
  return <NewsDetail {...props} />;
}
