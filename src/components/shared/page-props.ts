import type { AppData, ContentArticle, ContentCategory, Notification, ProfileEdits } from "@/datas/types";
export interface TabPageProps { data: AppData; onBack: () => void; }
export interface MembersPageProps extends TabPageProps {}
export interface ProfilePageProps extends TabPageProps { onEdit: () => void; onSupport: (action: "contact" | "about" | "policies") => void; saveMessage?: string; }
export interface ProfileEditPageProps extends TabPageProps { onSave: (edits: ProfileEdits) => void | Promise<void>; }
export interface NotificationsPageProps extends TabPageProps {
  onOpenNotification: (id: string) => void;
  onMarkAllRead: () => void;
  storageMessage?: string;
}
export interface NotificationDetailPageProps {
  notification: Notification;
  isDemo: boolean;
  onBack: () => void;
  onSetRead: (id: string, read: boolean) => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
}
export interface UtilityPageProps {
  data: AppData;
  onBack: () => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
}
export interface ArticlePageProps {
  data: AppData;
  article: ContentArticle;
  onBack: () => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
  onOpenContent: (category: ContentCategory) => void;
}
export interface ContentListPageProps extends UtilityPageProps {
  onChangeCategory: (category: ContentCategory) => void;
}
