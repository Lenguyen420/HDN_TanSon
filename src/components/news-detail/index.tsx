import ArticleLayout from "@/components/shared/article-layout";
import type { ArticlePageProps } from "@/components/shared/page-props";

export default function NewsDetail(props: ArticlePageProps) {
  return <ArticleLayout {...props} category="news" />;
}
