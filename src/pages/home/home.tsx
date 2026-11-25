import type { MemberDirectoryScope } from "@/components/shared/page-props";
import type { AppData, ContentCategory, UtilityId } from "@/datas/types";
import Home from "@/components/home";

interface HomePageProps {
  data: AppData;
  onOpenMemberDirectory: (scope: MemberDirectoryScope) => void;
  onOpenContent: (category: ContentCategory) => void;
  onOpenUtility: (id: UtilityId) => void;
  onOpenWardMiniApp: () => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
  contentCategory: ContentCategory;
  onChangeCategory: (category: ContentCategory) => void;
}

export default function HomePage(props: HomePageProps) {
  return <Home {...props} />;
}
