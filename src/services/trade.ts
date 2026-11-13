import { features } from "@/datas/features";
import { previewTradeActor } from "@/datas/trade-preview";
import { apiRequest, apiBaseUrl, ApiError, resolveApiImage } from "./api";
import { registrationTokens } from "./registration-notifications";
import type { TradeActor, TradeImage, TradeResult } from "./trade-types";
let session: {
  accessToken: string;
  expiresIn: number;
  user: TradeActor;
  until: number;
} | null = null;
let pending: Promise<TradeActor> | null = null;
export const currentTradeUser = () =>
  features.tradePreview ? previewTradeActor : session?.user || null;
export async function loginTrade(): Promise<TradeActor> {
  if (features.tradePreview) return previewTradeActor;
  if (session && session.until > Date.now()) return session.user;
  if (pending) return pending;
  const task = (async () => {
    const tokens = registrationTokens();
    let headers: Record<string, string> = {};
    if (!tokens.length) {
      const { getAccessToken } = await import("zmp-sdk/apis");
      let token: string;
      try {
        token = await getAccessToken({});
      } catch {
        throw new Error(
          "Vui lòng đăng ký hội viên trên thiết bị này hoặc mở Mini App trong Zalo để xác thực.",
        );
      }
      headers = { Authorization: "Bearer " + token };
    }
    const result = await apiRequest<
      TradeResult<{ accessToken: string; expiresIn: number; user: TradeActor }>
    >("trade-session", {
      method: "POST",
      headers,
      body: JSON.stringify(tokens.length ? { tokens } : {}),
    });
    session = {
      ...result.data,
      until: Date.now() + result.data.expiresIn * 1000 - 30000,
    };
    window.dispatchEvent(new Event("tanson-trade-auth"));
    return session.user;
  })();
  pending = task;
  try {
    return await task;
  } finally {
    pending = null;
  }
}
export async function tradeRequest<T>(
  path: string,
  method = "GET",
  body?: unknown,
  required = false,
): Promise<TradeResult<T>> {
  if (features.tradePreview) {
    const { previewTradeRequest } = await import("./trade-preview");
    return previewTradeRequest<T>(path, method, body);
  }
  if (required) await loginTrade();
  try {
    const result = await apiRequest<TradeResult<T>>(path, {
      method,
      headers: session
        ? { Authorization: "Bearer " + session.accessToken }
        : {},
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    return result || { success: true, data: undefined as T };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      session = null;
      window.dispatchEvent(new Event("tanson-trade-auth"));
    }
    throw error;
  }
}
export function tradeImage(value?: string | null) {
  return resolveApiImage(value) || "";
}
export async function uploadTradeImage(file: File): Promise<TradeImage> {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    file.size > 10 * 1024 * 1024
  )
    throw new Error("Chọn ảnh JPG, PNG hoặc WebP tối đa 10 MB.");
  if (features.tradePreview) {
    const { previewTradeImage } = await import("./trade-preview");
    return previewTradeImage(file);
  }
  await loginTrade();
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode();
    let edge = 1280;
    let blob: Blob | null = null;
    do {
      const ratio = Math.min(1, edge / Math.max(image.width, image.height)),
        canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * ratio));
      canvas.height = Math.max(1, Math.round(image.height * ratio));
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Không thể xử lý ảnh.");
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.76),
      );
      edge = Math.floor(edge * 0.75);
    } while (blob && blob.size > 256 * 1024 && edge >= 360);
    if (!blob || blob.size > 1024 * 1024)
      throw new Error("Ảnh quá nhiều chi tiết. Vui lòng chọn ảnh nhỏ hơn.");
    const result = await apiRequest<TradeResult<{ id: string; url: string }>>(
      "trade-media",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + session!.accessToken,
          "Content-Type": "application/octet-stream",
        },
        body: blob,
      },
    );
    return { id: result.data.id, url: URL.createObjectURL(blob) };
  } finally {
    URL.revokeObjectURL(url);
  }
}
// Stream events while the conversation is open. The caller also reloads from
// durable message history after reconnecting, so a lost connection loses no text.
export function watchTradeConversation(
  conversationId: string,
  onMessage: () => void,
) {
  if (features.tradePreview) {
    window.addEventListener("tanson-trade-preview-message", onMessage);
    return () =>
      window.removeEventListener("tanson-trade-preview-message", onMessage);
  }
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const fallback = setInterval(() => {
    if (!document.hidden && !controller.signal.aborted) onMessage();
  }, 10000);
  const run = async () => {
    if (controller.signal.aborted) return;
    try {
      await loginTrade();
      onMessage();
      const response = await fetch(
        apiBaseUrl + "/trade-conversations/" + conversationId + "/events",
        {
          headers: { Authorization: "Bearer " + session!.accessToken },
          signal: controller.signal,
        },
      );
      if (!response.ok || !response.body) throw new Error("Stream unavailable");
      const reader = response.body.getReader(),
        decoder = new TextDecoder();
      let buffer = "";
      while (!controller.signal.aborted) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let end;
        while ((end = buffer.indexOf("\n\n")) !== -1) {
          const event = buffer.slice(0, end);
          buffer = buffer.slice(end + 2);
          if (event.includes("event: CHAT_MESSAGE")) onMessage();
        }
      }
    } catch {
      /* History reload on reconnect is the fallback. */
    }
    if (!controller.signal.aborted) timer = setTimeout(() => void run(), 2000);
  };
  void run();
  return () => {
    controller.abort();
    clearInterval(fallback);
    if (timer) clearTimeout(timer);
  };
}
