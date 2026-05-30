"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type AuthUser = { email: string; name: string };

export default function AuthNavButton({
  navScrolled,
}: {
  navScrolled: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  const [configured, setConfigured] = useState(true);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { configured?: boolean; user?: AuthUser | null }) => {
        setConfigured(data.configured !== false);
        setUser(data.user ?? null);
      })
      .catch(() => {
        setConfigured(false);
        setUser(null);
      });
  }, [pathname]);

  const linkClass = navScrolled
    ? "text-slate-600 hover:text-slate-900"
    : "text-white/85 hover:text-white";

  if (user === undefined) return null;
  if (!configured) return null;

  if (user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <span
          className={`max-w-[8rem] truncate text-xs font-medium ${navScrolled ? "text-slate-600" : "text-white/90"}`}
          title={user.email}
        >
          {user.name}
        </span>
        <button
          type="button"
          className={`rounded-lg px-2 py-1 text-xs font-medium ${linkClass}`}
          onClick={() => {
            void fetch("/api/auth/logout", { method: "POST" }).then(() => {
              setUser(null);
              router.refresh();
            });
          }}
        >
          退出
        </button>
      </div>
    );
  }

  if (pathname === "/login") return null;

  return (
    <Link
      href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}
      className={`hidden rounded-lg px-2 py-1 text-xs font-medium sm:inline ${linkClass}`}
    >
      登录
    </Link>
  );
}
