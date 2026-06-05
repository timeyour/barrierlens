"use client";

import { useAuthDialog } from "@/components/AuthDialogProvider";
import type { NavSurfaceTone } from "@/config/navSurface";
import { useAuth } from "@/hooks/useAuth";

export default function AuthSyncButton({ tone }: { tone: NavSurfaceTone }) {
  const { user, loading, logout } = useAuth();
  const { openAuthDialog } = useAuthDialog();

  const linkClass =
    tone === "onLight"
      ? "text-slate-600 hover:text-slate-900"
      : "text-white/85 hover:text-white";

  return (
    <div className="flex items-center gap-2">
      {loading ? null : user ? (
        <>
          <span
            className={`hidden max-w-[10rem] truncate text-xs font-medium sm:inline ${
              tone === "onLight" ? "text-slate-700" : "text-white/90"
            }`}
            title={user.email}
          >
            {user.email}
          </span>
          <button
            type="button"
            className={`rounded-lg px-2 py-1 text-xs font-medium ${linkClass}`}
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
          className={`rounded-lg px-2 py-1 text-xs font-medium ${linkClass}`}
          onClick={openAuthDialog}
        >
          登录同步记录
        </button>
      )}
    </div>
  );
}
