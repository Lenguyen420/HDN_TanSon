import { useEffect, useLayoutEffect, useMemo, useRef, useState, ComponentType } from "react";
import { Page } from "zmp-ui";
import HomePage from "@/pages/home/home";
import RegisterPage from "@/pages/register/register";
import MembersPage from "@/pages/members/members";
import NotificationsPage from "@/pages/notifications/notifications";
import ProfilePage from "@/pages/profile/profile";
import ProfileEditPage from "@/pages/profile-edit/profile-edit";
import NewsPage from "@/pages/news/news";
import EventsPage from "@/pages/events/events";
import MemberVisitsPage from "@/pages/member-visits/member-visits";
import AboutPage from "@/pages/about/about";
import FeesPage from "@/pages/fees/fees";
import ActivitiesPage from "@/pages/activities/activities";
import SponsorshipsPage from "@/pages/sponsorships/sponsorships";
import ContactPage from "@/pages/contact/contact";
import EventAssistantPage from "@/pages/event-assistant/event-assistant";
import NewsDetailPage from "@/pages/news-detail/news-detail";
import EventDetailPage from "@/pages/event-detail/event-detail";
import MemberVisitDetailPage from "@/pages/member-visit-detail/member-visit-detail";
import NotificationDetailPage from "@/pages/notification-detail/notification-detail";
import BottomNavigation from "@/components/bottom-navigation";
import { getAppData } from "@/services/association";
import { readNotificationState, saveNotificationState } from "@/services/notifications";
import type { NotificationReadState } from "@/services/notifications";
import { applyProfileEdits, readProfileEdits, saveProfileEdits } from "@/services/profile";
import type { AppData, ContentCategory, NavigationTab, ProfileEdits, UtilityId } from "@/datas/types";
import type { ArticlePageProps, ContentListPageProps, UtilityPageProps } from "@/components/shared/page-props";

type Screen =
  | { kind: "utility"; id: UtilityId }
  | { kind: "list"; category: ContentCategory }
  | { kind: "article"; category: ContentCategory; articleId: string }
  | { kind: "notification"; notificationId: string }
  | { kind: "profile-edit" };

const utilityPages: Record<UtilityId, ComponentType<UtilityPageProps>> = {
  about: AboutPage, fees: FeesPage, activities: ActivitiesPage,
  sponsorships: SponsorshipsPage, contact: ContactPage, "event-assistant": EventAssistantPage,
};
const listPages: Record<ContentCategory, ComponentType<ContentListPageProps>> = {
  news: NewsPage, events: EventsPage, "member-visits": MemberVisitsPage,
};
const detailPages: Record<ContentCategory, ComponentType<ArticlePageProps>> = {
  news: NewsDetailPage, events: EventDetailPage, "member-visits": MemberVisitDetailPage,
};

export default function AppShell() {
  const [sourceData, setData] = useState<AppData | null>(null);
  const [profileEdits, setProfileEdits] = useState(readProfileEdits);
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const data = useMemo(() => sourceData ? applyProfileEdits(sourceData, profileEdits) : null, [sourceData, profileEdits]);
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [screens, setScreens] = useState<Screen[]>([]);
  const [homeCategory, setHomeCategory] = useState<ContentCategory>("news");
  const [notificationReadState, setNotificationReadState] = useState(readNotificationState);
  const [notificationStorageMessage, setNotificationStorageMessage] = useState("");
  const content = useRef<HTMLDivElement>(null);
  const scrollHistory = useRef<number[]>([]);
  const pendingScroll = useRef(0);
  const scroller = () => content.current?.closest(".zaui-page");

  useEffect(() => {
    let mounted = true;
    setError("");
    getAppData().then((result) => { if (mounted) setData(result); })
      .catch((error) => { if (mounted) setError(error instanceof Error ? error.message : "Không thể tải dữ liệu."); });
    return () => { mounted = false; };
  }, [loadAttempt]);

  useLayoutEffect(() => {
    scroller()?.scrollTo(0, pendingScroll.current);
  }, [screens, activeTab, data]);

  const navigate = (tab: NavigationTab) => {
    setContactOpen(false);
    pendingScroll.current = 0;
    scrollHistory.current = [];
    setScreens([]);
    setActiveTab(tab);
  };
  const openScreen = (screen: Screen) => {
    if (screen.kind === "utility" && screen.id === "contact") {
      setContactOpen(true);
      return;
    }
    scrollHistory.current.push(scroller()?.scrollTop || 0);
    pendingScroll.current = 0;
    setScreens((current) => [...current, screen]);
  };
  const goBack = () => {
    pendingScroll.current = scrollHistory.current.pop() || 0;
    setScreens((current) => current.slice(0, -1));
  };
  const openArticle = (category: ContentCategory, articleId: string) => openScreen({ kind: "article", category, articleId });
  const savePersonalProfile = (edits: ProfileEdits) => {
    if (!data || edits.memberId !== data.profile.memberId) throw new Error("Không tìm thấy hồ sơ hội viên.");
    saveProfileEdits(edits);
    setProfileEdits(edits);
    setProfileSaveMessage("Đã lưu thay đổi trên thiết bị. Thông tin chưa được gửi đến Hội.");
    goBack();
  };
  const openContent = (category: ContentCategory) => openScreen({ kind: "list", category });
  const changeListCategory = (category: ContentCategory) => {
    pendingScroll.current = 0;
    setScreens((current) => [...current.slice(0, -1), { kind: "list", category }]);
  };
  const updateReadState = (patch: NotificationReadState) => {
    const next = { ...notificationReadState, ...patch };
    setNotificationReadState(next);
    setNotificationStorageMessage(saveNotificationState(next) ? "" : "Đã cập nhật trạng thái trong phiên này, nhưng chưa lưu được trên thiết bị.");
  };
  const setNotificationRead = (id: string, read: boolean) => updateReadState({ [id]: read });
  const openNotification = (id: string) => {
    setNotificationRead(id, true);
    openScreen({ kind: "notification", notificationId: id });
  };
  const markAllNotificationsRead = () => {
    const updates: NotificationReadState = {};
    for (const notice of data?.notifications || []) updates[notice.id] = true;
    updateReadState(updates);
  };
  const notifications = (data?.notifications || []).map((notice) => ({
    ...notice,
    unread: notificationReadState[notice.id] === undefined ? notice.unread : !notificationReadState[notice.id],
  }));

  const renderPage = () => {
    if (!data) return null;
    const screen = screens[screens.length - 1];
    const common = { data, onBack: goBack, onOpenArticle: openArticle, onOpenContent: openContent };
    if (screen?.kind === "profile-edit") return <ProfileEditPage data={data} onBack={goBack} onSave={savePersonalProfile} />;
    if (screen?.kind === "notification") {
      const notification = notifications.find((notice) => notice.id === screen.notificationId);
      if (!notification) return <section className="surface-card empty-state"><p>Thông báo đang được cập nhật.</p><button type="button" className="primary-button" onClick={goBack}>Quay lại</button></section>;
      return <NotificationDetailPage key={notification.id} notification={notification} isDemo={data.isDemo} onBack={goBack} onSetRead={setNotificationRead} onOpenArticle={openArticle} />;
    }
    if (screen?.kind === "utility") {
      const UtilityPage = utilityPages[screen.id];
      return <UtilityPage key={screen.id} {...common} />;
    }
    if (screen?.kind === "list") {
      const ListPage = listPages[screen.category];
      return <ListPage key={screen.category} {...common} onChangeCategory={changeListCategory} />;
    }
    if (screen?.kind === "article") {
      const article = data.content[screen.category].articles.find((item) => item.id === screen.articleId);
      if (!article) return <section className="surface-card empty-state"><h1>Bài viết đang được cập nhật</h1><button type="button" className="primary-button" onClick={goBack}>Quay lại</button></section>;
      const DetailPage = detailPages[screen.category];
      return <DetailPage key={article.id} article={article} {...common} />;
    }
    switch (activeTab) {
      case "register": return <RegisterPage data={data} onBack={() => navigate("home")} />;
      case "members": return <MembersPage data={data} onBack={() => navigate("home")} />;
      case "notifications": return <NotificationsPage data={{ ...data, notifications }} onBack={() => navigate("home")} onOpenNotification={openNotification} onMarkAllRead={markAllNotificationsRead} storageMessage={notificationStorageMessage} />;
      case "profile": return <ProfilePage data={data} onBack={() => navigate("home")} onEdit={() => { setProfileSaveMessage(""); openScreen({ kind: "profile-edit" }); }} saveMessage={profileSaveMessage} />;
      case "home": return <HomePage data={data} onNavigate={navigate} onOpenContent={openContent} onOpenUtility={(id) => openScreen({ kind: "utility", id })} onOpenArticle={openArticle} contentCategory={homeCategory} onChangeCategory={setHomeCategory} />;
    }
  };
  return (
    <Page className="association-page">
      <div className="app-shell" ref={content}>
        {!data ? <div className="data-status" role="status"><p>{error || "Đang tải dữ liệu…"}</p>{error && <button type="button" className="primary-button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Thử lại</button>}</div> : renderPage()}
      </div>
      <BottomNavigation activeTab={activeTab} onChange={navigate} unreadCount={notifications.filter((notice) => notice.unread).length} />
      {data && contactOpen && <ContactPage data={data} onBack={() => setContactOpen(false)} onOpenArticle={openArticle} />}
    </Page>
  );
}
