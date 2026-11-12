import type { AppData, ContentCategory, NavigationTab, UtilityId } from "@/datas/types";
import Home from "@/components/home";

interface HomePageProps {
  data: AppData;
  onNavigate: (tab: NavigationTab) => void;
  onOpenContent: (category: ContentCategory) => void;
  onOpenUtility: (id: UtilityId) => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
  contentCategory: ContentCategory;
  onChangeCategory: (category: ContentCategory) => void;
}

export default function HomePage(props: HomePageProps) {
  return <Home {...props} />;
}
