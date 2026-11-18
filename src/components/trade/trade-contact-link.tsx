import type { ReactNode } from "react";
import {
  isZaloTradeContact,
  openZaloTradeContact,
  trackTradeContact,
  tradeContactHref,
  type TradeContactChannel,
} from "@/services/trade-contact";
import type { TradePost } from "@/services/trade-types";

export default function TradeContactLink({
  post,
  channel = "phone",
  label,
  children,
}: {
  post: TradePost;
  channel?: TradeContactChannel;
  label?: string;
  children: ReactNode;
}) {
  const href = tradeContactHref(channel, channel === "phone" ? post.contactPhone : post.contactZalo);
  if (!href) return null;
  return (
    <a
      href={href}
      aria-label={label}
      target={channel === "zalo" ? "_blank" : undefined}
      rel={channel === "zalo" ? "noopener noreferrer" : undefined}
      onClick={(event) => {
        trackTradeContact(post.id, channel);
        if (isZaloTradeContact()) {
          event.preventDefault();
          void openZaloTradeContact(channel, href);
        }
      }}
    >
      {children}
    </a>
  );
}
