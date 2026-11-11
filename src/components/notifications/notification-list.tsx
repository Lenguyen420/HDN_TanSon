import type { Notification } from "@/datas/types";
import AppIcon from "@/components/icons";
import ArticleImage from "@/components/shared/article-image";

interface NotificationListProps { notifications: Notification[]; onSelect: (notification: Notification) => void; }
export default function NotificationList({ notifications, onSelect }: NotificationListProps) {
  return (
    <div className="notification-inbox-list">
      {notifications.map((notice) => (
        <button type="button" className={`notification-inbox-card ${notice.unread ? "is-unread" : "is-read"}`} key={notice.id} onClick={() => onSelect(notice)} aria-label={`${notice.unread ? "Chưa đọc" : "Đã đọc"}: ${notice.title}`}>
          <span className="notification-thumbnail"><ArticleImage src={notice.image} alt="" />{notice.unread && <i aria-hidden="true" />}</span>
          <div className="notification-inbox-copy"><span className="notification-kind">{notice.category || "Thông báo"}</span><h3>{notice.title}</h3><p>{notice.description}</p><div className="notification-card-footer"><time>{notice.date}{notice.time ? ` · ${notice.time}` : ""}</time><span className="notice-read-label">{notice.unread ? "Chưa đọc" : "Đã đọc"}</span></div></div>
          <AppIcon name="arrow" className="notification-card-arrow" />
        </button>
      ))}
    </div>
  );
}
