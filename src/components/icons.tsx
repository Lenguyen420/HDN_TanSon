import { ReactNode, SVGProps } from "react";
export type IconName = "home" | "register" | "members" | "bell" | "user" | "info" | "wallet" | "calendar" | "handshake" | "phone" | "arrow" | "check" | "close" | "building";
const paths: Record<IconName, ReactNode> = {
  home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1Z" /><path d="M9 21V12h6v9" /></>,
  register: <><path d="M14 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-9" /><path d="m10 14 1-4 8-8 3 3-8 8-4 1Z" /></>,
  members: <><circle cx="9" cy="7" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 4v3" /></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8M10 21h4" /></>,
  user: <><circle cx="12" cy="7" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
  wallet: <><path d="M20 7V4H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h16V7H5a1 1 0 0 1 0-2" /><path d="M21 12h-6v5h6M17 14.5h.01" /></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M7 3v4M17 3v4M3 11h18m-13 5 3 3 5-5" /></>,
  handshake: <><path d="m2 12 4-7 5 2 3-2 8 7-4 6-4 3-5-3-7-6Z" /><path d="m11 7-4 5 3 2 4-3 5 5M5 15l3-4M12 17l3 3" /></>,
  phone: <path d="m7 3 3 5-3 3a16 16 0 0 0 6 6l3-3 5 3c-1 7-6 5-11 2S1 9 3 5l4-2Z" />,
  arrow: <path d="m9 5 7 7-7 7" />,
  check: <path d="m5 12 4 4L19 6" />,
  close: <path d="m6 6 12 12M6 18 18 6" />,
  building: <><path d="M5 21V3h14v18M2 21h20M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3" /></>,
};
export default function AppIcon({ name, ...props }: SVGProps<SVGSVGElement> & { name: IconName }) {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>{paths[name]}</svg>;
}
