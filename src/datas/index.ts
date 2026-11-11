import { association } from "./association";
import { banners } from "./banners";
import { members, profile } from "./members";
import { notifications } from "./notifications";
import { utilities } from "./utilities";
import type { AppData } from "./types";
import { news } from "./news";
import { events } from "./events";
import { memberVisits } from "./member-visits";
import { utilityPages } from "./utility-pages";
import { registration } from "./registration";

export const mockAppData: AppData = {
  isDemo: true,
  association,
  banners,
  utilities,
  members,
  notifications,
  profile,
  content: { news, events, "member-visits": memberVisits },
  utilityPages,
  registration,
};
