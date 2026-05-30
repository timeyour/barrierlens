"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

type AuthState =
  | { status: "loading" }
  | { status: "unconfigured" }
  | { status: "guest" }
  | { status: "authed"; name: string; email: string };

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [auth, setAuth] = useState<AuthState>({ status: "loading" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data: { configured?: boolean; user?: { email: string; name: string } | null }) => {
        if (!data.configured) {
          setAuth({ status: "unconfigured" });
          return;
        }
        if (data.user) {
          setAuth({ status: "authed", ...data.user });
          return;
        }
        setAuth({ status: "guest" });
      })
      .catch(() => setAuth({ status: "guest" }));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as { error?: string; user?: { name: string; email: string } };
      if (!res.ok) {
        setError(data.error ?? "登录失败");
        return;
      }
      router.replace(redirectTo);
      router.refresh();
    } catch {
      setError("网络错误，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  if (auth.status === "loading") {
    return <p className="text-sm text-slate-500">正在检查登录状态…</p>;
  }

  if (auth.status === "authed") {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-emerald-800">
          已登录为 <strong>{auth.name}</strong>（{auth.email}）
        </p>
        <Link href={redirectTo} className="btn-primary inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold">
          进入
        </Link>
      </div>
    );
  }

  if (auth.status === "unconfigured") {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-semibold">团队登录尚未配置</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-900/90">
          在 <code className="rounded bg-white/80 px-1">.env.local</code> 中添加
          <code className="mx-1 rounded bg-white/80 px-1">TEAM_LOGIN_EMAIL</code> 与
          <code className="mx-1 rounded bg-white/80 px-1">TEAM_LOGIN_PASSWORD</code> 后重启 dev。
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-blue-700 underline">
          返回首页（无需登录也可使用）
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="login-email" className="sr-only">
          邮箱
        </label>
        <input
          id="login-email"
          type="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="team@example.com"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="login-password" className="sr-only">
          密码
        </label>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
        />
      </div>
      {error && (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="btn-primary w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-60"
      >
        {submitting ? "登录中…" : "登录"}
      </button>
      <p className="text-center text-xs text-slate-500">首页与上报无需登录</p>
    </form>
  );
}
