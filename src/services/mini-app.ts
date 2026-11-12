import { tanSonMiniApp } from "@/datas/tan-son-mini-app";

export async function openTanSonMiniApp(): Promise<void> {
  if (window.location.hostname === "h5.zdn.vn" || /Zalo/i.test(navigator.userAgent)) {
    const { openMiniApp } = await import("zmp-sdk/apis");
    await openMiniApp(tanSonMiniApp);
    return;
  }
  const params = new URLSearchParams(tanSonMiniApp.params);
  window.location.assign(`https://zalo.me/s/${tanSonMiniApp.appId}/?${params}`);
}
