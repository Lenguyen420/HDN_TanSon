import { resolveApiImage } from "./api";

export function introductionVideoSource(value?: string) {
  if (!value?.trim()) return null;
  try {
    const managed = /^\/api\/v1\/public\/introduction-videos\/[a-f0-9-]{36}$/.test(value.trim());
    const url = new URL(managed ? resolveApiImage(value.trim())! : value.trim());
    const local = managed && url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname);
    if ((!local && url.protocol !== "https:") || url.username || url.password) return null;
    const host = url.hostname.toLowerCase();
    if (["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be", "www.youtube-nocookie.com"].includes(host)) {
      const id = host === "youtu.be" ? url.pathname.split("/")[1] : url.searchParams.get("v") || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1];
      if (!id || !/^[\w-]{11}$/.test(id)) return null;
      return { kind: "youtube" as const, url: `https://www.youtube-nocookie.com/embed/${id}`, originalUrl: url.href };
    }
    return { kind: "video" as const, url: url.href, originalUrl: url.href };
  } catch { return null; }
}
