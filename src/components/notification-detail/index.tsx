import type { NotificationDetailPageProps } from "@/components/shared/page-props";
import PageToolbar from "@/components/shared/page-toolbar";
import ArticleImage from "@/components/shared/article-image";
import AppIcon from "@/components/icons";

export default function NotificationDetail({ notification, isDemo, onBack, onSetRead, onOpenArticle }: NotificationDetailPageProps) {
  return (
    <main className="notification-detail-page">
      <PageToolbar title="Chi tiết thông báo" onBack={onBack} headingLevel="h2" sticky />
      {notification.image && <ArticleImage src={notification.image} alt={notification.title} className="notification-detail-cover" />}
      <article className="notification-detail-body">
        <div className="notification-detail-tags"><span className="notification-kind">{notification.category || "Thông báo từ Hội"}</span><span className={`notice-read-label ${notification.unread ? 'is-unread' : ''}`}>{notification.unread ? "Chưa đọc" : "Đã đọc"}</span>{isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}</div>
        <h1>{notification.title}</h1>
        <div className="notification-detail-meta"><AppIcon name="calendar" /><span>{notification.date}{notification.time ? ` · ${notification.time}` : ""}</span></div>
        <p className="notification-detail-lead">{notification.description}</p>
        <div className="notification-detail-prose">{(notification.paragraphs || [notification.description]).map((paragraph, index) => <p key={index}>{paragraph}</p>)}</div>
        <div className="notification-sender"><AppIcon name="building" /><div><strong>Ban thư ký Hội</strong><span>Hội Doanh nghiệp Phường Tân Sơn</span></div></div>
        {notification.related && <button type="button" className="primary-button" onClick={() => onOpenArticle(notification.related!.category, notification.related!.articleId)}>Xem {notification.related.category === "events" ? "sự kiện" : "bài viết"} liên quan <AppIcon name="arrow" /></button>}
        <button type="button" className="notification-read-toggle" onClick={() => onSetRead(notification.id, notification.unread)}><AppIcon name={notification.unread ? "check" : "bell"} />{notification.unread ? "Đánh dấu đã đọc" : "Đánh dấu chưa đọc"}</button>
      </article>
    </main>
  );
}
