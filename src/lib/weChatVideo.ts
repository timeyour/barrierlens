/** 微信内置浏览器（X5 内核）检测与 autoplay 解锁 */

export function isWeChatBrowser(): boolean {
  if (typeof navigator === "undefined") return false;
  return /MicroMessenger/i.test(navigator.userAgent);
}

type WeixinJSBridge = {
  invoke: (
    method: string,
    args: Record<string, unknown>,
    callback?: (...args: unknown[]) => void,
  ) => void;
};

function getWeixinBridge(): WeixinJSBridge | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { WeixinJSBridge?: WeixinJSBridge }).WeixinJSBridge;
}

/**
 * 微信 WebView 需在 WeixinJSBridge 就绪后调用 play；
 * getNetworkType 是社区验证过的 autoplay 解锁入口。
 */
export function bindWeChatVideoAutoplay(onReady: () => void): () => void {
  if (!isWeChatBrowser()) return () => {};

  const trigger = () => {
    const bridge = getWeixinBridge();
    if (bridge) {
      bridge.invoke("getNetworkType", {}, () => onReady());
    } else {
      onReady();
    }
  };

  if (getWeixinBridge()) {
    trigger();
  } else {
    document.addEventListener("WeixinJSBridgeReady", trigger, false);
  }

  return () => {
    document.removeEventListener("WeixinJSBridgeReady", trigger);
  };
}
