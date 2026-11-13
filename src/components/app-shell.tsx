import useTradeNotifications from "@/components/shared/use-trade-notifications";
import { tradeRequest } from "@/services/trade";
import usePublicNotifications from "@/components/shared/use-public-notifications";
import { buildEventHistory } from "@/services/event-history";
import useEventUpdates from "@/components/shared/use-event-updates";
import { features } from "@/datas/features";
import EventCalendarPage from "@/pages/event-calendar/event-calendar";
import EventAttendancePage from "@/pages/event-attendance/event-attendance";
import EventDocumentsPage from "@/pages/event-documents/event-documents";
import EventMinutesPage from "@/pages/event-minutes/event-minutes";
import EventCheckInPage from "@/pages/event-check-in/event-check-in";
import EventDocumentListPage from "@/pages/event-document-list/event-document-list";
import EventMinuteListPage from "@/pages/event-minute-list/event-minute-list";
import type { EventSection, EventResourceSection } from "@/datas/event-workspace";
import type { EventWorkspacePageProps, EventResourcePageProps } from "@/components/shared/page-props";
import { getEventAttendance, checkInEvent, joinEvent, openEventFile, type AttendanceReceipt } from "@/services/event-workspace";
import { openTanSonMiniApp } from "@/services/mini-app";
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
import MapPage from "@/pages/map/map";
import TradePage from "@/pages/trade/trade";
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
import { getAppData, type AppResource } from "@/services/association";
import { readNotificationState, saveNotificationState, mergeNotifications } from "@/services/notifications";
import type { NotificationReadState } from "@/services/notifications";
import { applyProfileEdits, readProfileEdits, saveProfileEdits } from "@/services/profile";
import type { AppData, ContentCategory, NavigationTab, ProfileEdits, UtilityId } from "@/datas/types";
import type { ArticlePageProps, ContentListPageProps, UtilityPageProps } from "@/components/shared/page-props";

import { saveZaloSdkProfile, type MemberIdentity } from "@/services/member-access";

import useRegistrationNotifications from "@/components/shared/use-registration-notifications";

import PoliciesPage from "@/pages/policies/policies";
import { updateRegistrationProfile, syncRegistrationAvatar } from "@/services/registration-notifications";

type Screen =
  | { kind: "event-workspace"; section: EventSection }
  | { kind: "event-resource"; section: EventResourceSection; articleId: string }
  | { kind: "utility"; id: UtilityId; tradePostId?:string; tradeManaged?:boolean; tradeCommentId?:string }
  | { kind: "list"; category: ContentCategory }
  | { kind: "article"; category: ContentCategory; articleId: string }
  | { kind: "notification"; notificationId: string }
  | { kind: "profile-edit" }
  | { kind: "policies" };

const utilityPages: Record<UtilityId, ComponentType<UtilityPageProps>> = {
  "ban-do": MapPage,
  "giao-thuong": TradePage, about: AboutPage, fees: FeesPage, activities: ActivitiesPage,
  sponsorships: SponsorshipsPage, contact: ContactPage, "event-assistant": EventAssistantPage,
};
const listPages: Record<ContentCategory, ComponentType<ContentListPageProps>> = {
  news: NewsPage, events: EventsPage, "member-visits": MemberVisitsPage,
};
const detailPages: Record<ContentCategory, ComponentType<ArticlePageProps>> = {
  news: NewsDetailPage, events: EventDetailPage, "member-visits": MemberVisitDetailPage,
};

const eventWorkspacePages: Record<EventSection, ComponentType<EventWorkspacePageProps>> = {
  calendar: EventCalendarPage, attendance: EventAttendancePage, documents: EventDocumentsPage, minutes: EventMinutesPage,
};
const eventResourcePages: Record<EventResourceSection, ComponentType<EventResourcePageProps>> = {
  attendance: EventCheckInPage, documents: EventDocumentListPage, minutes: EventMinuteListPage,
};
export default function AppShell() {
  const {notifications:tradeNotices,error:tradeNoticeError}=useTradeNotifications();
  const { notifications: publicNotices, error: publicNoticeError } = usePublicNotifications();
  const {notifications: eventNotices, participations: eventParticipations, setParticipations: setEventParticipations, loading: eventUpdatesLoading, error: eventUpdatesError} = useEventUpdates();
  const { notifications: registrationNotices, profiles: registrationProfiles, setProfiles: setRegistrationProfiles, error: registrationNoticeError } = useRegistrationNotifications();
  const [sourceData, setData] = useState<AppData | null>(null);
  const [profileEdits, setProfileEdits] = useState(readProfileEdits);
  const [profileSaveMessage, setProfileSaveMessage] = useState("");
  const [contactOpen, setContactOpen] = useState(false);
  const [attendance, setAttendance] = useState<Record<string, AttendanceReceipt>>({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [attendanceError, setAttendanceError] = useState("");
  const [miniAppError, setMiniAppError] = useState("");
  const [miniAppOpening, setMiniAppOpening] = useState(false);
  const openWardMiniApp = async () => {
    if (miniAppOpening) return;
    setMiniAppError("");
    setMiniAppOpening(true);
    try { await openTanSonMiniApp(); }
    catch { setMiniAppError("Chưa mở được Mini App UBND phường Tân Sơn. Vui lòng thử lại."); }
    finally { setMiniAppOpening(false); }
  };
  const [zaloIdentity, setZaloIdentity] = useState<MemberIdentity | null>(null);
  const [authExpiresAt, setAuthExpiresAt] = useState(0);
  const [authPending, setAuthPending] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const authentication = useRef(false);
  const avatarSyncAttempt = useRef("");
  const data = useMemo(() => {
    if (!sourceData) return null;
    const application = (registrationProfiles || []).find((item) => item.status === "approved" && item.member) || registrationProfiles?.[0];
    const ownMember = application?.member || zaloIdentity?.member;
    const directoryMember = ownMember ? sourceData.members.find((item) => item.id === ownMember.id) : undefined;
    const member = ownMember ? { ...directoryMember, ...ownMember, avatar: ownMember.avatar || directoryMember?.avatar || application?.avatar || "" } : null;
    const personalized = zaloIdentity || application ? {
      ...sourceData,
      zaloUser: zaloIdentity?.user,
      registration: {...sourceData.registration, avatar: zaloIdentity?.user?.avatar},
      registrationProfile: application,
      members: member ? [...sourceData.members.filter((item) => item.id !== member.id), member] : sourceData.members,
      profile: member ? { memberId: member.id, memberCode: member.id, joinedAt: member.joinedAt || "", status: "Đang hoạt động" } : sourceData.profile,
    } : sourceData;
    const result = application ? personalized : applyProfileEdits(personalized, profileEdits);
    return { ...result, utilityPages: { ...result.utilityPages, activities: buildEventHistory(result.content.events.articles, eventParticipations) } };
  }, [sourceData, profileEdits, zaloIdentity, registrationProfiles, eventParticipations]);
  useEffect(() => {
    const target = (registrationProfiles || []).find((item) => item.status === "approved" && item.member) || registrationProfiles?.[0];
    const avatar = zaloIdentity?.user?.avatar;
    if (!target || !avatar || (target.avatar && (!target.member || target.member.avatar))) return;
    const key = target.id + ":" + avatar;
    if (avatarSyncAttempt.current === key) return;
    avatarSyncAttempt.current = key;
    void syncRegistrationAvatar(target.id, avatar).then(setRegistrationProfiles).catch(() => setAuthMessage("Chưa đồng bộ được ảnh hội viên. Vui lòng mở lại ứng dụng để thử lại."));
  }, [zaloIdentity, registrationProfiles, setRegistrationProfiles]);
  useEffect(() => {
    if (!authExpiresAt) return;
    const timer = window.setTimeout(() => {
      setZaloIdentity(null);
      setAuthExpiresAt(0);
      setAuthMessage("Phiên xác nhận đã hết hạn. Vui lòng xác nhận lại thông tin Zalo.");
    }, Math.max(0, authExpiresAt - Date.now()));
    return () => window.clearTimeout(timer);
  }, [authExpiresAt]);
  const authenticate = async () => {
    if (zaloIdentity && authExpiresAt > Date.now()) return true;
    if (authentication.current) return false;
    authentication.current = true;
    setAuthPending(true);
    setAuthError("");
    setAuthMessage("");
    try {
      const { identity } = await saveZaloSdkProfile();
      setZaloIdentity(identity);
      setAuthExpiresAt(Date.now() + 15 * 60 * 1000);
      setAuthMessage(identity.phoneNotice || "");

      return true;
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Chưa thể lưu thông tin Zalo. Vui lòng thử lại.");
      return false;
    } finally {
      authentication.current = false;
      setAuthPending(false);
    }
  };
  const [error, setError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [screens, setScreens] = useState<Screen[]>(() => typeof window !== "undefined" && new URLSearchParams(window.location?.search || "").has("tradePost") ? [{kind:"utility",id:"giao-thuong"}] : []);
  const [homeCategory, setHomeCategory] = useState<ContentCategory>("news");
  const [notificationReadState, setNotificationReadState] = useState(readNotificationState);
  const [notificationStorageMessage, setNotificationStorageMessage] = useState("");
  const content = useRef<HTMLDivElement>(null);
  const scrollHistory = useRef<number[]>([]);
  const pendingScroll = useRef(0);
  const scroller = () => content.current?.closest(".zaui-page");

  const screen = screens[screens.length - 1];
  const resources: AppResource[] = ["settings"];
  if (!screen && activeTab === "home") resources.push("banners", "members", homeCategory === "member-visits" ? "visits" : homeCategory);
  if (!screen && ["members", "register"].includes(activeTab)) resources.push("members");
  if (screen?.kind === "list" || screen?.kind === "article") resources.push(screen.category === "member-visits" ? "visits" : screen.category);
  if (screen?.kind === "utility" && ["event-assistant", "activities"].includes(screen.id)) resources.push("events");
  if (screen?.kind === "event-workspace" || screen?.kind === "event-resource") resources.push("events");
  const resourceKey = [...new Set(resources)].sort().join(",");
  const previousAttempt = useRef(loadAttempt);
  useEffect(() => {
    let mounted = true;
    setError("");
    setLoading(true);
    const force = previousAttempt.current !== loadAttempt;
    previousAttempt.current = loadAttempt;
    getAppData({
      resources: resourceKey.split(",") as AppResource[], force,
      onUpdate: (result) => { if (mounted) setData(result); },
    }).then((result) => { if (mounted) setData(result); })
      .catch((error) => { if (mounted) setError(error instanceof Error ? error.message : "Không thể tải dữ liệu."); })
      .then(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [loadAttempt, resourceKey]);

  useEffect(() => {
    if (!resourceKey.split(",").includes("members")) return;
    let active = true, busy = false;
    const refreshMembers = async () => {
      if (document.visibilityState === "hidden" || busy) return;
      busy = true;
      try {
        const latest = await getAppData({resources:["members"],force:true});
        if (active) setData(latest);
      } catch { /* Preserve the last loaded directory while offline. */ }
      finally { busy = false; }
    };
    const timer = window.setInterval(() => { void refreshMembers(); }, 30000);
    const wake = () => { void refreshMembers(); };
    window.addEventListener("focus", wake); document.addEventListener("visibilitychange", wake);
    return () => { active = false; window.clearInterval(timer); window.removeEventListener("focus", wake); document.removeEventListener("visibilitychange", wake); };
  }, [resourceKey]);

  const attendanceScreen = (screen?.kind === "event-workspace" || screen?.kind === "event-resource") && screen.section === "attendance";
  const attendanceIds = attendanceScreen ? (sourceData?.content.events.articles || []).map(article => article.id).join(",") : "";
  useEffect(() => {
    if (!attendanceScreen) return;
    let active = true;
    setAttendanceLoading(true); setAttendanceError("");
    const ids = attendanceIds ? attendanceIds.split(",") : [];
    void Promise.all(ids.map(id => getEventAttendance(id).then(value => ({ status: "fulfilled" as const, value }), reason => ({ status: "rejected" as const, reason })))).then(results => {
      if (!active) return;
      setAttendance(current => {
        const next = { ...current };
        results.forEach((result, index) => {
          if (result.status === "fulfilled") {
            if (result.value) next[result.value.eventId] = result.value;
            else delete next[ids[index]];
          }
        });
        return next;
      });
      if (results.some(result => result.status === "rejected")) setAttendanceError("Chưa tải đủ lịch sử điểm danh. Vui lòng quay lại và thử lại.");
      setAttendanceLoading(false);
    });
    return () => { active = false; };
  }, [attendanceScreen, attendanceIds, loadAttempt]);

  useLayoutEffect(() => {
    scroller()?.scrollTo(0, pendingScroll.current);
  }, [screens, activeTab]);

  const navigationAttempt = useRef(0);
  const navigate = async (tab: NavigationTab) => {
    const needsIdentity = features.zaloAuthentication && (tab === "profile" || tab === "register") && !sourceData?.isDemo;
    if (needsIdentity && authentication.current) return;
    const attempt = ++navigationAttempt.current;
    if (needsIdentity && !await authenticate()) return;
    if (attempt !== navigationAttempt.current) return;
    setAuthError("");
    if (!needsIdentity) setAuthMessage("");
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
  const openEvent = (articleId: string, section: EventSection) => {
    if (section === "calendar") openArticle("events", articleId);
    else openScreen({ kind: "event-resource", section, articleId });
  };
  const submitJoin = async (eventId: string, name: string, company: string) => {
    const { participation, persisted } = await joinEvent(eventId, name, company);
    setEventParticipations(current => [...current.filter(item => item.eventId !== eventId), participation]);
    return { persisted };
  };
  const submitCheckIn = async (eventId: string) => {
    const { receipt, persisted } = await checkInEvent(eventId);
    setAttendance(current => ({ ...current, [eventId]: receipt }));
    setEventParticipations(current => current.map(item => item.eventId === eventId ? { ...item, checkedAt: receipt.checkedAt, status: "attended" } : item));
    if (!persisted) setAttendanceError("Đã điểm danh trên hệ thống nhưng thiết bị không lưu được mã theo dõi. Hãy giữ màn hình xác nhận.");
    return { persisted };
  };
  const savePersonalProfile = async (edits: ProfileEdits) => {
    if (data?.registrationProfile) {
      const expectedId = data.registrationProfile.member?.id || data.registrationProfile.id;
      if (edits.memberId !== expectedId) throw new Error("Hồ sơ không khớp. Vui lòng mở lại trang Cá nhân.");
      const profiles = await updateRegistrationProfile(data.registrationProfile.id, edits);
      setRegistrationProfiles(profiles);
      setProfileSaveMessage("Đã lưu thông tin của bạn lên hệ thống Hội.");
      goBack();
      return;
    }
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
    const notice = notifications.find(n=>n.id===id);
    if(notice?.tradePostId){if(notice.tradeNoticeId)void tradeRequest("trade-notifications/read","PATCH",{ids:[notice.tradeNoticeId]},true).catch(()=>{});openScreen({kind:"utility",id:"giao-thuong",tradePostId:notice.tradePostId,tradeManaged:notice.tradeManaged,tradeCommentId:notice.tradeCommentId});return;}
    openScreen({ kind: "notification", notificationId: id });
  };
  const markAllNotificationsRead = () => {
    const updates: NotificationReadState = {};
    for (const notice of notifications) updates[notice.id] = true;
    updateReadState(updates);
  };
  const notifications = mergeNotifications(publicNotices ?? data?.notifications ?? [], [...eventNotices, ...registrationNotices, ...tradeNotices], notificationReadState);

  const renderPage = () => {
    if (!data) return null;
    const screen = screens[screens.length - 1];
    const common = { data, eventHistoryLoading: eventUpdatesLoading || (screen?.kind === "utility" && screen.id === "activities" && loading), eventHistoryError: eventUpdatesError, onBack: goBack, onOpenArticle: openArticle, onOpenContent: openContent,
      onOpenEventSection: (section: EventSection) => openScreen({ kind: "event-workspace", section }),
      onOpenEventResource: (articleId: string, section: EventResourceSection) => openEvent(articleId, section),
    };
    const workspaceProps = { data, onBack: goBack, onOpenEvent: openEvent, attendance, attendanceLoading: attendanceLoading || eventUpdatesLoading, attendanceError, participations: eventParticipations };
    if (screen?.kind === "event-workspace") {
      const WorkspacePage = eventWorkspacePages[screen.section];
      return <WorkspacePage key={screen.section} {...workspaceProps} />;
    }
    if (screen?.kind === "event-resource") {
      const article = data.content.events.articles.find(item => item.id === screen.articleId);
      if (!article) return <section className="surface-card empty-state"><p>Thông tin sự kiện đang được tải.</p><button type="button" onClick={goBack}>Quay lại</button></section>;
      const ResourcePage = eventResourcePages[screen.section];
      return <ResourcePage key={screen.section + article.id} {...workspaceProps} article={article} onCheckIn={submitCheckIn} onOpenFile={openEventFile} />;
    }
    if (screen?.kind === "policies") return <PoliciesPage onBack={goBack} />;
    if (screen?.kind === "profile-edit") return <ProfileEditPage data={data} onBack={goBack} onSave={savePersonalProfile} />;
    if (screen?.kind === "notification") {
      const notification = notifications.find((notice) => notice.id === screen.notificationId);
      if (!notification) return <section className="surface-card empty-state"><p>Thông báo đang được cập nhật.</p><button type="button" className="primary-button" onClick={goBack}>Quay lại</button></section>;
      return <NotificationDetailPage key={notification.id} notification={notification} isDemo={data.isDemo} onBack={goBack} onSetRead={setNotificationRead} onOpenArticle={openArticle} />;
    }
    if (screen?.kind === "utility") {
      const UtilityPage = utilityPages[screen.id];
      return <UtilityPage key={screen.id+(screen.tradePostId||"")} {...common} initialTradePostId={screen.tradePostId} initialTradeManaged={screen.tradeManaged} initialTradeCommentId={screen.tradeCommentId} />;
    }
    if (screen?.kind === "list") {
      const ListPage = listPages[screen.category];
      return <ListPage key={screen.category} {...common} onChangeCategory={changeListCategory} />;
    }
    if (screen?.kind === "article") {
      const article = data.content[screen.category].articles.find((item) => item.id === screen.articleId);
      if (!article) return <section className="surface-card empty-state"><h1>Bài viết đang được cập nhật</h1><button type="button" className="primary-button" onClick={goBack}>Quay lại</button></section>;
      const DetailPage = detailPages[screen.category];
      return <DetailPage key={article.id} article={article} {...common} participation={eventParticipations.find(item => item.eventId === article.id)} participationLoading={eventUpdatesLoading} onJoinEvent={submitJoin} />;
    }
    switch (activeTab) {
      case "register": return <RegisterPage data={data} onBack={() => navigate("home")} />;
      case "members": return <MembersPage data={data} onBack={() => navigate("home")} />;
      case "notifications": return <NotificationsPage data={{ ...data, notifications }} onBack={() => navigate("home")} onOpenNotification={openNotification} onMarkAllRead={markAllNotificationsRead} storageMessage={[notificationStorageMessage, publicNoticeError, registrationNoticeError, eventUpdatesError, tradeNoticeError].filter(Boolean).join(" ")} />;
      case "profile": return <ProfilePage onSupport={(action) => action === "policies" ? openScreen({kind:"policies"}) : openScreen({kind:"utility",id:action})} data={data} onBack={() => navigate("home")} onEdit={() => { setProfileSaveMessage(""); openScreen({ kind: "profile-edit" }); }} saveMessage={profileSaveMessage} />;
      case "home": return <HomePage onOpenWardMiniApp={() => void openWardMiniApp()} data={data} onNavigate={navigate} onOpenContent={openContent} onOpenUtility={(id) => openScreen({ kind: "utility", id })} onOpenArticle={openArticle} contentCategory={homeCategory} onChangeCategory={setHomeCategory} />;
    }
  };
  return (
    <Page className={"association-page"+(screen?.kind==="utility"&&screen.id==="giao-thuong"?" trade-fullscreen":"")}>
      <div className="app-shell" ref={content}>
        {miniAppError && <div className="data-status" role="alert"><p>{miniAppError}</p></div>}
        {miniAppOpening && <div className="data-status" role="status"><p>Đang mở Mini App UBND phường Tân Sơn…</p></div>}
        {eventUpdatesError && <div className="data-status" role="status"><p>{eventUpdatesError}</p></div>}
        {registrationNoticeError && <div className="data-status" role="status"><p>{registrationNoticeError}</p></div>}
        {authPending && <div className="data-status" role="status"><p>Đang lưu tên và ảnh Zalo…</p></div>}
        {authError && <div className="data-status" role="alert"><p>{authError} Chọn lại Cá nhân hoặc Đăng kí để thử lại.</p></div>}
        {authMessage && !authPending && <div className="data-status" role="status"><p>{authMessage}</p></div>}
        {data && (loading || error) && <div className="data-status" role="status"><p>{error || "Đang cập nhật dữ liệu…"}</p>{error && <button type="button" className="primary-button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Thử lại</button>}</div>}
        {!data ? <div className="data-status" role="status"><p>{error || "Đang tải dữ liệu…"}</p>{error && <button type="button" className="primary-button" onClick={() => setLoadAttempt((attempt) => attempt + 1)}>Thử lại</button>}</div> : renderPage()}
      </div>
      {!(screen?.kind === "utility" && screen.id === "giao-thuong") && <BottomNavigation activeTab={activeTab} onChange={navigate} unreadCount={notifications.filter((notice) => notice.unread).length} />}
      {data && contactOpen && <ContactPage data={data} onBack={() => setContactOpen(false)} onOpenArticle={openArticle} />}
    </Page>
  );
}
