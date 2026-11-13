import type { AppData, ContentArticle, ContentCategory, Notification, ProfileEdits } from "@/datas/types";
import type { EventSection, EventResourceSection } from "@/datas/event-workspace";
import type { AttendanceReceipt } from "@/services/event-workspace";
import type { EventParticipation } from "@/services/event-workspace";
export interface EventWorkspacePageProps {
  data: AppData;
  onBack: () => void;
  onOpenEvent: (articleId: string, section: EventSection) => void;
  attendance: Record<string, AttendanceReceipt>;
  attendanceLoading: boolean;
  attendanceError: string;
  participations?: EventParticipation[];
}
export interface EventResourcePageProps extends EventWorkspacePageProps {
  article: ContentArticle;
  onCheckIn: (eventId: string) => Promise<{ persisted: boolean }>;
  onOpenFile: (url: string) => Promise<void>;
}
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
  initialTradePostId?: string;
  initialTradeManaged?: boolean;
  initialTradeCommentId?: string;
  eventHistoryLoading?: boolean;
  eventHistoryError?: string;
  data: AppData;
  onBack: () => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
  onOpenEventSection?: (section: EventSection) => void;
}
export interface ArticlePageProps {
  participation?: EventParticipation;
  participationLoading?: boolean;
  onJoinEvent?: (eventId: string, name: string, company: string) => Promise<{ persisted: boolean }>;
  data: AppData;
  article: ContentArticle;
  onBack: () => void;
  onOpenArticle: (category: ContentCategory, articleId: string) => void;
  onOpenContent: (category: ContentCategory) => void;
  onOpenEventResource?: (articleId: string, section: EventResourceSection) => void;
}
export interface ContentListPageProps extends UtilityPageProps {
  onChangeCategory: (category: ContentCategory) => void;
}
