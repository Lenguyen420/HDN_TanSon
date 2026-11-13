import {
  previewTradeActor,
  previewTradeCategories,
  createPreviewTradeData,
} from "@/datas/trade-preview";
import type {
  TradePost,
  TradeReview,
  TradeImage,
  TradeResult,
} from "./trade-types";

// This adapter is called only when the explicit local preview flag is enabled.
// All mutations stay in memory and never request protected backend data.
const state = createPreviewTradeData();
const reviews: TradeReview[] = [];
const media = new Map<string, TradeImage>();
const imagesOf = (keys: string[]) => keys.map(key => media.get(key)).filter((image): image is TradeImage => Boolean(image));
const postTemplate = createPreviewTradeData().posts[0];
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();
const ok = (data: unknown) => ({ success: true, data });
export function previewTradeImage(file: File): TradeImage {
  const image = { id: id(), url: URL.createObjectURL(file) };
  media.set(image.id, image);
  // The picker revokes its own preview URL on unmount; posts keep a separate URL.
  return { id: image.id, url: URL.createObjectURL(file) };
}
export async function previewTradeRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<TradeResult<T>> {
  const url = new URL(path, "https://preview.invalid/");
  const parts = url.pathname.split("/").filter(Boolean);
  const payload = (body || {}) as Record<string, unknown>;
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const limit = Math.max(1, Number(url.searchParams.get("limit")) || 20);
  const list = (items: unknown[]) => ({
    success: true,
    data: items.slice((page - 1) * limit, page * limit),
    meta: {
      page,
      limit,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
    },
  });
  let result: {
    success: boolean;
    data: unknown;
    meta?: TradeResult<unknown>["meta"];
  };
  const post = () => {
    const row = state.posts.find(
      (p) => p.id === parts[1] || p.slug === parts[1],
    );
    if (!row) throw Error("Không tìm thấy tin xem thử.");
    return row;
  };
  if (parts[0] === "trade-post-categories")
    result = list(previewTradeCategories);
  else if (path.startsWith("trade-posts/me/analytics"))
    result = ok({
      range: {
        from: url.searchParams.get("from") || now(),
        to: url.searchParams.get("to") || now(),
      },
      postCount: state.posts.filter((p) => p.ownerId === previewTradeActor.id)
        .length,
      totals: {
        views: 24,
        uniqueVisitors: 18,
        contactPhone: 0,
        contactZalo: 0,
        share: 0,
        save: 3,
      },
      reviews: { count: reviews.length, averageRating: 0 },
      topPosts: state.posts
        .filter((p) => p.ownerId === previewTradeActor.id)
        .map((p) => ({ id: p.id, title: p.title, views: p.viewCount })),
      timeseries: [],
    });
  else if (
    parts[0] === "trade-posts" &&
    ((parts.length === 1 && method === "GET") || parts[1] === "me")
  ) {
    let rows = state.posts.filter((p) =>
      parts[1] === "me"
        ? parts[2] === "saved"
          ? p.saved
          : p.ownerId === previewTradeActor.id
        : p.status === "PUBLISHED",
    );
    for (const key of ["category", "purpose", "status"] as const) {
      const value = url.searchParams.get(key);
      if (value) rows = rows.filter((p) => p[key] === value);
    }
    const search = url.searchParams.get("search")?.toLocaleLowerCase();
    if (search)
      rows = rows.filter((p) =>
        (p.title + " " + p.summary).toLocaleLowerCase().includes(search),
      );
    if (url.searchParams.get("featured") === "true")
      rows = rows.filter((p) => p.featured);
    const min = url.searchParams.get("minPrice"),
      max = url.searchParams.get("maxPrice");
    if (min)
      rows = rows.filter((p) => p.price != null && p.price >= Number(min));
    if (max)
      rows = rows.filter((p) => p.price != null && p.price <= Number(max));
    const sort = url.searchParams.get("sortBy");
    rows = [...rows].sort(
      sort === "price_asc"
        ? (a, b) => (a.price || 0) - (b.price || 0)
        : sort === "price_desc"
          ? (a, b) => (b.price || 0) - (a.price || 0)
          : (a, b) => b.createdAt.localeCompare(a.createdAt),
    );
    result = list(rows);
  } else if (
    parts[0] === "trade-posts" &&
    parts.length === 1 &&
    method === "POST"
  ) {
    const key = id();
    const row = {
      ...postTemplate,
      ...payload,
      id: key,
      slug: key,
      ownerId: previewTradeActor.id,
      status: "DRAFT",
      createdAt: now(),
      updatedAt: now(),
      isOwner: true,
      images: imagesOf((payload.imageIds as string[]) || []),
    } as TradePost;
    row.thumbnailUrl = row.images[0]?.url || null;
    state.posts.unshift(row);
    result = ok(row);
  } else if (parts[0] === "trade-posts" && parts[2] === "reviews") {
    if (parts[3] === "summary")
      result = ok({
        count: reviews.filter((r) => r.tradePostId === parts[1]).length,
        averageRating: 0,
        counts: {},
      });
    else if (method === "GET")
      result = list(reviews.filter((r) => r.tradePostId === parts[1]));
    else if (parts[4] === "replies") {
      const row = reviews.find((r) => r.id === parts[3]);
      row?.replies?.push({
        id: id(),
        userId: previewTradeActor.id,
        content: String(payload.content || ""),
        createdAt: now(),
      });
      result = ok(row);
    } else {
      const row = {
        ...payload,
        rating: Number(payload.rating) || 5,
        content: String(payload.content || ""),
        id: id(),
        tradePostId: parts[1],
        userId: previewTradeActor.id,
        status: "PUBLISHED",
        createdAt: now(),
        images: [],
        imageIds: [],
        replies: [],
        isAuthor: true,
        user: {
          id: previewTradeActor.id,
          displayName: previewTradeActor.displayName,
        },
      } as TradeReview;
      reviews.push(row);
      result = ok(row);
    }
  } else if (parts[0] === "trade-posts") {
    const row = post();
    if (method === "DELETE" && parts.length === 2) {
      state.posts.splice(state.posts.indexOf(row), 1);
      result = ok(null);
    } else if (parts[2] === "save") {
      row.saved = method !== "DELETE";
      row.saveCount = Math.max(0, row.saveCount + (row.saved ? 1 : -1));
      result = ok({ saveCount: row.saveCount });
    } else if (parts[2] === "interactions") result = ok(true);
    else {
      if (method === "PATCH") {
        if (parts[2] === "submit") row.status = "PENDING";
        else if (parts[2] === "archive") row.status = "ARCHIVED";
        else {
          Object.assign(row, payload);
          if (payload.imageIds)
            row.images = imagesOf(payload.imageIds as string[]);
          row.thumbnailUrl = row.images[0]?.url || null;
        }
        row.updatedAt = now();
      }
      result = ok(row);
    }
  } else if (parts[0] === "trade-conversations") {
    let row = state.conversations.find((c) => c.id === parts[1]);
    if (parts.length === 1 && method === "GET")
      result = list(state.conversations);
    else if (parts.length === 1 && method === "POST") {
      const target = state.posts.find((p) => p.id === payload.tradePostId);
      if (!target) throw Error("Không tìm thấy tin xem thử.");
      row = state.conversations.find((c) => c.tradePostId === target.id);
      if (!row) {
        row = {
          id: id(),
          tradePostId: target.id,
          customerId: previewTradeActor.id,
          ownerId: target.ownerId,
          lastMessageAt: now(),
          unreadCount: 0,
          other: target.owner?.displayName,
          post: { id: target.id, title: target.title },
        };
        state.conversations.unshift(row);
      }
      if (payload.message)
        state.messages.push({
          id: id(),
          conversationId: row.id,
          senderId: previewTradeActor.id,
          content: String(payload.message),
          readAt: null,
          createdAt: now(),
        });
      result = ok(row);
    } else if (!row) throw Error("Không tìm thấy hội thoại xem thử.");
    else if (parts[2] === "messages") {
      if (method === "GET")
        result = list(
          state.messages.filter((m) => m.conversationId === row!.id),
        );
      else {
        const message = {
          id: id(),
          conversationId: row.id,
          senderId: previewTradeActor.id,
          content: String(payload.content || ""),
          readAt: null,
          createdAt: now(),
        };
        state.messages.push(message);
        row.lastMessageAt = message.createdAt;
        window.dispatchEvent(new Event("tanson-trade-preview-message"));
        result = ok(message);
      }
    } else {
      if (parts[2] === "read") row.unreadCount = 0;
      result = ok(row);
    }
  } else if (parts[0] === "trade-notifications") {
    if (method === "GET") result = list(state.notices);
    else {
      for (const n of state.notices)
        if (((payload.ids as string[]) || []).includes(n.id)) n.read = true;
      result = ok(true);
    }
  } else if (parts[0] === "reviews" || parts[0] === "trade-management") {
    if (parts[1] === "me")
      result = list(
        reviews.filter(
          (r) => r.tradePostId === url.searchParams.get("tradePostId"),
        ),
      );
    else if (method === "GET") result = list(reviews);
    else {
      const reviewId = parts[0] === "reviews" ? parts[1] : parts[2];
      const row = reviews.find((r) => r.id === reviewId);
      if (row) {
        if (method === "DELETE" && parts[3] !== "reply")
          reviews.splice(reviews.indexOf(row), 1);
        else if (parts[parts.length - 1] === "reply")
          row.replyContent =
            method === "DELETE" ? null : String(payload.content || "");
        else Object.assign(row, payload);
      }
      result = ok(row || null);
    }
  } else if (parts[0] === "trade-media") {
    media.delete(parts[1]);
    result = ok(true);
  } else throw Error("Thao tác này chưa có trong chế độ xem thử.");
  // Return snapshots so component state does not mutate behind React's back.
  return structuredClone(result) as TradeResult<T>;
}
