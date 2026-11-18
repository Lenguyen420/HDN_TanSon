import { tanSonMiniApp } from "@/datas/tan-son-mini-app";

export function isZaloMiniApp() {
  return window.location.hostname === "h5.zdn.vn" || /Zalo/i.test(navigator.userAgent);
}

export async function openMiniAppWebview(url: string) {
  const { openWebview } = await import("zmp-sdk/apis");
  await openWebview({ url, config: { style: "normal" } });
}

export async function openTanSonMiniApp(): Promise<void> {
  if (isZaloMiniApp()) {
    const { openMiniApp } = await import("zmp-sdk/apis");
    await openMiniApp(tanSonMiniApp);
    return;
  }
  const params = new URLSearchParams(tanSonMiniApp.params);
  window.location.assign(`https://zalo.me/s/${tanSonMiniApp.appId}/?${params}`);
}
