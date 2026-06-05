"use client";

import { useAuthDialog } from "@/components/AuthDialogProvider";
import { navLoginButtonClasses, type NavSurfaceTone } from "@/config/navSurface";
import { useAuth } from "@/hooks/useAuth";

export default function AuthSyncButton({ tone }: { tone: NavSurfaceTone }) {
  const { user, loading, logout } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  const textLinkClass =
    tone === "onLight"
      ? "text-slate-600 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500/60"
      : "text-white/85 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400/70";

  return (
    <div className="flex items-center gap-2">
      {loading ? null : user ? (
        <>
          <span
            className={`hidden max-w-[10rem] truncate text-sm font-medium sm:inline md:text-[15px] ${
              tone === "onLight" ? "text-slate-700" : "text-white/90"
            }`}
            title={user.email}
          >
            {user.email}
          </span>
          <button
            type="button"
            className={`rounded-lg px-2 py-1 text-sm font-medium md:text-[15px] ${textLinkClass}`}
            onClick={async () => {
              await logout();
            }}
          >
            退出
          </button>
        </>
      ) : (
        <button
          type="button"
          className={navLoginButtonClasses(tone)}
          onClick={openAuthDialog}
          aria-label="登录同步记录"
        >
          登录
        </button>
      )}
    </div>
  );
}
