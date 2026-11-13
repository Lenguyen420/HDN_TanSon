import { features } from "@/datas/features";
import { useEffect, useState } from "react";
import PageToolbar from "@/components/shared/page-toolbar";
import type { UtilityPageProps } from "@/components/shared/page-props";
import { currentTradeUser, loginTrade, tradeRequest } from "@/services/trade";
import type {
  TradeActor,
  TradePost,
  TradeConversation,
  TradeNotice,
} from "@/services/trade-types";
import TradeBrowse from "./trade-browse";
import TradeDetail from "./trade-detail";
import TradeEditor from "./trade-editor";
import TradeMine from "./trade-mine";
import TradeInbox from "./trade-inbox";
import TradeNotices from "./trade-notices";
import { TradeReports, TradeSellerReviews } from "./trade-reports";
import { useTradeAction, useTradeList } from "./use-trade";
import TradeIcon from "./trade-icon";
import "@/css/trade.scss";
type View =
  | {
      kind:
        | "browse"
        | "saved"
        | "mine"
        | "reports"
        | "seller-reviews"
        | "notifications";
    }
  | { kind: "detail"; id: string; managed?: boolean; commentId?: string }
  | { kind: "edit"; post?: TradePost }
  | { kind: "inbox"; conversation?: TradeConversation };
export default function Trade({ onBack }: UtilityPageProps) {
  const [actor, setActor] = useState<TradeActor | null>(currentTradeUser),
    [view, setView] = useState<View>(() => {
      const value = new URLSearchParams(window.location.search).get(
        "tradePost",
      );
      return value && /^[a-z0-9-]{1,200}$/.test(value)
        ? { kind: "detail", id: value }
        : { kind: "browse" };
    }),
    task = useTradeAction();
  useEffect(() => {
    const update = () => setActor(currentTradeUser());
    window.addEventListener("tanson-trade-auth", update);
    return () => window.removeEventListener("tanson-trade-auth", update);
  }, []);
  const notices = useTradeList<TradeNotice>(
    actor ? "trade-notifications?limit=100" : "",
    Boolean(actor),
    actor ? 15000 : 0,
  );
  const unread = actor ? notices.data.filter((n) => !n.read).length : 0;
  async function authenticated(next: View, selling = false) {
    await task.run(async () => {
      const user = await loginTrade();
      setActor(user);
      if (selling && (user.role !== "BUSINESS" || user.status !== "ACTIVE"))
        throw new Error(
          "Đăng tin dành cho hội viên doanh nghiệp đang hoạt động. Vui lòng hoàn tất đăng ký hoặc liên hệ Ban thư ký Hội.",
        );
      setView(next);
    });
  }
  const detail = (id: string, managed = false) =>
    setView({ kind: "detail", id, managed });
  async function openNotice(notice: TradeNotice) {
    if (notice.commentId) {
      setView({
        kind: "detail",
        id: notice.tradePostId,
        commentId: notice.commentId,
      });
    } else if (notice.conversationId) {
      await task.run(async () => {
        const result = await tradeRequest<TradeConversation>(
          "trade-conversations/" + notice.conversationId,
          "GET",
          undefined,
          true,
        );
        setView({ kind: "inbox", conversation: result.data });
      });
    } else if (notice.type === "TRADE_REVIEW_RECEIVED")
      void authenticated({ kind: "seller-reviews" }, true);
    else if (
      notice.type.startsWith("TRADE_REVIEW_") ||
      notice.type === "TRADE_POST_NEW"
    )
      detail(notice.tradePostId);
    else detail(notice.tradePostId, true);
  }
  const titles: Record<string, string> = {
    browse: "GIAO THƯƠNG",
    saved: "Tin đã lưu",
    mine: "Tin của doanh nghiệp",
    edit: "Nội dung giao thương",
    detail: "Cơ hội kết nối",
    inbox: "Hội thoại hợp tác",
    reports: "Hiệu quả kết nối",
    "seller-reviews": "Phản hồi đánh giá",
    notifications: "Thông báo giao thương",
  };
  return (
    <main className={"trade-mini trade-view-" + view.kind}>
      <PageToolbar
        title={titles[view.kind]}
        subtitle="Kết nối cộng đồng"
        onBack={() =>
          view.kind === "browse" ? onBack() : setView({ kind: "browse" })
        }
      />
      <div className="trade-body">
        {features.tradePreview && (
          <p className="surface-card" role="status">
            Đang xem thử giao diện giao thương. Các thao tác thử chỉ lưu trong
            phiên này.
          </p>
        )}
        {(view.kind === "browse" || view.kind === "saved") && (
          <div className="trade-explore-heading">
            <div>
              <span className="trade-eyebrow">Khám phá cơ hội</span>
              <h2>
                {view.kind === "saved" ? "Tin đã lưu" : "Tin giao thương mới"}
              </h2>
            </div>
            <div className="trade-explore-actions">
              <button
                disabled={task.busy}
                onClick={() => void authenticated({ kind: "saved" })}
              >
                <TradeIcon name="bookmark" /> Tin đã lưu
              </button>
              <button
                className="primary-button"
                disabled={task.busy}
                onClick={() => void authenticated({ kind: "edit" }, true)}
              >
                Đăng tin
              </button>
            </div>
          </div>
        )}
        <div className="trade-header-tools">
          <button
            disabled={task.busy}
            aria-label="Tin đã lưu"
            onClick={() => void authenticated({ kind: "saved" })}
          >
            <TradeIcon name="bookmark" />
          </button>
          <button
            disabled={task.busy}
            aria-label={"Thông báo giao thương, " + unread + " chưa đọc"}
            onClick={() => void authenticated({ kind: "notifications" })}
          >
            <TradeIcon name="bell" />
            {unread > 0 && (
              <span className="trade-unread-count">
                {unread > 99 ? "99+" : unread}
              </span>
            )}
          </button>
        </div>
        <nav className="trade-nav" aria-label="Giao thương">
          <button
            aria-pressed={view.kind === "browse"}
            onClick={() => setView({ kind: "browse" })}
          >
            Khám phá
          </button>
          <button
            aria-pressed={view.kind === "saved"}
            disabled={task.busy}
            onClick={() => void authenticated({ kind: "saved" })}
          >
            Đã lưu
          </button>
          <button
            aria-pressed={view.kind === "mine"}
            disabled={task.busy}
            onClick={() => void authenticated({ kind: "mine" }, true)}
          >
            Tin của tôi
          </button>
          <button
            aria-pressed={view.kind === "inbox"}
            disabled={task.busy}
            onClick={() => void authenticated({ kind: "inbox" })}
          >
            Hội thoại
          </button>
          <button
            aria-pressed={view.kind === "notifications"}
            disabled={task.busy}
            onClick={() => void authenticated({ kind: "notifications" })}
          >
            Thông báo
          </button>
        </nav>
        {view.kind !== "detail" &&
          view.kind !== "browse" &&
          view.kind !== "saved" && (
            <div className="trade-actions">
              <button
                className="primary-button"
                disabled={task.busy}
                onClick={() => void authenticated({ kind: "edit" }, true)}
              >
                Đăng tin giao thương
              </button>
              {actor ? (
                <small>
                  {actor.displayName}
                  {actor.role === "BUSINESS" ? " · Doanh nghiệp hội viên" : ""}
                </small>
              ) : (
                <button
                  disabled={task.busy}
                  onClick={() =>
                    void task.run(async () => {
                      setActor(await loginTrade());
                    })
                  }
                >
                  Xác thực hồ sơ
                </button>
              )}
            </div>
          )}
        {task.error && <p role="alert">{task.error}</p>}
        {view.kind === "browse" || view.kind === "saved" ? (
          <TradeBrowse
            key={view.kind}
            saved={view.kind === "saved"}
            onOpen={(id) => detail(id)}
          />
        ) : view.kind === "detail" ? (
          <TradeDetail
            key={view.id}
            id={view.id}
            focusCommentId={view.commentId}
            actor={actor}
            managed={view.managed}
            onEdit={(post) => setView({ kind: "edit", post })}
            onConversation={(conversation) =>
              setView({ kind: "inbox", conversation })
            }
          />
        ) : view.kind === "edit" && actor ? (
          <TradeEditor
            key={view.post?.id || "new"}
            post={view.post}
            actor={actor}
            onDone={() => setView({ kind: "mine" })}
            onCancel={() => setView({ kind: "mine" })}
          />
        ) : view.kind === "mine" ? (
          <TradeMine
            onOpen={(id) => detail(id, true)}
            onEdit={(post) => setView({ kind: "edit", post })}
            onCreate={() => setView({ kind: "edit" })}
            onAnalytics={() => setView({ kind: "reports" })}
            onReviews={() => setView({ kind: "seller-reviews" })}
          />
        ) : view.kind === "inbox" && actor ? (
          <TradeInbox
            actor={actor}
            initial={view.conversation}
            onOpenPost={(id) => detail(id)}
          />
        ) : view.kind === "reports" ? (
          <TradeReports />
        ) : view.kind === "seller-reviews" ? (
          <TradeSellerReviews />
        ) : view.kind === "notifications" ? (
          <TradeNotices onOpen={(notice) => void openNotice(notice)} />
        ) : null}
      </div>
    </main>
  );
}
