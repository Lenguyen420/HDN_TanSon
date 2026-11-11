import { useState } from "react";
import type { NotificationsPageProps } from "@/components/shared/page-props";
import PageToolbar from "@/components/shared/page-toolbar";
import FilterChips from "@/components/shared/filter-chips";
import AppIcon from "@/components/icons";
import NotificationList from "./notification-list";

export default function Notifications({ data, onBack, onOpenNotification, onMarkAllRead, storageMessage }: NotificationsPageProps) {
  const [filter, setFilter] = useState("all");
  const unread = data.notifications.filter((notice) => notice.unread).length;
  const visible = data.notifications.filter((notice) => filter === "all" || (filter === "unread" ? notice.unread : !notice.unread));
  return (
    <main className="notifications-page">
      <PageToolbar title="Thông báo" subtitle="Cập nhật thông tin từ Hội" onBack={onBack} />
      <div className="notification-inbox">
        <section className="notification-summary"><span className="notification-summary-icon"><AppIcon name="bell" />{unread > 0 && <i />}</span><div><h2>{unread > 0 ? `Bạn có ${unread} thông báo chưa đọc` : "Bạn đã xem tất cả thông báo"}</h2><p>Đồng hành cùng các hoạt động của Hội</p></div></section>
        <div className="notification-inbox-toolbar"><span>{data.notifications.length} thông báo</span><button type="button" onClick={onMarkAllRead} disabled={unread === 0}><AppIcon name="check" />Đọc tất cả</button></div>
        <FilterChips label="Lọc thông báo" value={filter} onChange={setFilter} options={[{ value: "all", label: `Tất cả (${data.notifications.length})` }, { value: "unread", label: `Chưa đọc (${unread})` }, { value: "read", label: `Đã đọc (${data.notifications.length - unread})` }]} />
        {storageMessage && <p className="notification-storage-message" role="status">{storageMessage}</p>}
        {data.isDemo && <span className="demo-badge">Dữ liệu mẫu</span>}
        <NotificationList notifications={visible} onSelect={(notification) => onOpenNotification(notification.id)} />
        {visible.length === 0 && <div className="notification-empty"><AppIcon name="bell" /><h3>{filter === "unread" ? "Không còn thông báo chưa đọc" : "Chưa có thông báo"}</h3><p>Các cập nhật mới từ Hội sẽ hiển thị tại đây.</p></div>}
      </div>
    </main>
  );
}
