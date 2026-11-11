import AppIcon from "./icons";
import { navigationItems } from "@/datas/navigation";
import type { NavigationTab } from "@/datas/types";

export type { NavigationTab } from "@/datas/types";

interface BottomNavigationProps {
  activeTab: NavigationTab;
  onChange: (tab: NavigationTab) => void;
  unreadCount?: number;
}

export default function BottomNavigation({ activeTab, onChange, unreadCount = 0 }: BottomNavigationProps) {
  return (
    <nav className="bottom-navigation" aria-label="Điều hướng chính">
      <svg className="nav-curve" viewBox="0 0 120 78" aria-hidden="true">
        <path d="M0 0C17 0 17 8 23 23C36 55 84 55 97 23C103 8 103 0 120 0V78H0Z" />
      </svg>
      {navigationItems.map(({ id, label, icon }) => (
        <button
          key={id}
          type="button"
          className={`nav-item ${id === "home" ? "nav-home" : ""} ${activeTab === id ? "is-active" : ""}`}
          aria-current={activeTab === id ? "page" : undefined}
          aria-label={label}
          aria-describedby={id === "notifications" && unreadCount > 0 ? "notification-nav-count" : undefined}
          onClick={() => onChange(id)}
        >
          <span className="nav-icon"><AppIcon name={icon} />{id === "notifications" && unreadCount > 0 && <span id="notification-nav-count" className="notification-nav-badge" aria-label={`${unreadCount} thông báo chưa đọc`}>{unreadCount > 99 ? "99+" : unreadCount}</span>}</span>
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
