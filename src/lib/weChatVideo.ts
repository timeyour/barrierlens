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

function invokeBridgePlay(onReady: () => void): void {
  const bridge = getWeixinBridge();
  if (bridge) {
    bridge.invoke("getNetworkType", {}, () => onReady());
  } else {
    onReady();
  }
}

/**
 * 微信 WebView 需在 WeixinJSBridge 就绪后调用 play；
 * getNetworkType 是社区验证过的 autoplay 解锁入口。
 */
export function bindWeChatVideoAutoplay(onReady: () => void): () => void {
  if (!isWeChatBrowser()) return () => {};

  const trigger = () => invokeBridgePlay(onReady);

  if (getWeixinBridge()) {
    trigger();
    window.setTimeout(trigger, 300);
    window.setTimeout(trigger, 900);
  } else {
    document.addEventListener("WeixinJSBridgeReady", trigger, false);
  }

  return () => {
    document.removeEventListener("WeixinJSBridgeReady", trigger);
  };
}

export function bindHeroVideoPlayback(
  video: HTMLVideoElement,
  onActive?: () => void,
): () => void {
  video.muted = true;
  video.defaultMuted = true;
  video.volume = 0;
  video.playsInline = true;
  video.controls = false;
  video.disablePictureInPicture = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");
  video.setAttribute("x5-playsinline", "");
  video.setAttribute("x5-video-player-type", "h5-page");
  video.setAttribute("x5-video-player-fullscreen", "false");
  // 勿设 x5-video-orientation；勿在 <video> 上使用 poster（X5 会一直显示静态图）

  let disposed = false;

  const markActive = () => {
    if (disposed) return;
    onActive?.();
  };

  const tryPlay = () => {
    if (disposed || !video.isConnected) return;
    if (video.currentTime < 0.01 && video.readyState >= 1) {
      try {
        video.currentTime = 0.01;
      } catch {
        // ignore seek errors before metadata
      }
    }
    void video
      .play()
      .then(() => markActive())
      .catch(() => {});
  };

  const onTimeUpdate = () => {
    if (video.currentTime > 0 && !video.paused) markActive();
  };

  const mediaEvents = [
    "loadedmetadata",
    "loadeddata",
    "canplay",
    "canplaythrough",
    "playing",
  ] as const;

  for (const event of mediaEvents) {
    video.addEventListener(event, tryPlay);
  }
  video.addEventListener("timeupdate", onTimeUpdate);

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0]?.isIntersecting) tryPlay();
    },
    { threshold: 0.01 },
  );
  observer.observe(video);

  const onVisibility = () => {
    if (document.visibilityState === "visible") tryPlay();
  };
  const onPageShow = () => tryPlay();
  const onGesture = () => tryPlay();

  document.addEventListener("visibilitychange", onVisibility);
  window.addEventListener("pageshow", onPageShow);
  window.addEventListener("scroll", onGesture, { once: true, passive: true });
  document.addEventListener("touchstart", onGesture, { once: true, passive: true });
  document.addEventListener("click", onGesture, { once: true, passive: true });

  const unbindWeChat = bindWeChatVideoAutoplay(tryPlay);

  tryPlay();
  requestAnimationFrame(tryPlay);
  window.setTimeout(tryPlay, 120);
  window.setTimeout(tryPlay, 480);
  window.setTimeout(tryPlay, 1200);

  return () => {
    disposed = true;
    unbindWeChat();
    for (const event of mediaEvents) {
      video.removeEventListener(event, tryPlay);
    }
    video.removeEventListener("timeupdate", onTimeUpdate);
    observer.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    window.removeEventListener("pageshow", onPageShow);
  };
}
