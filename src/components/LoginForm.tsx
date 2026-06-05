"use client";

import EmailOtpLogin from "@/components/EmailOtpLogin";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
  const { configured, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  if (user) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-sm text-emerald-800">
          已登录：<strong>{user.email}</strong>
        </p>
        <Link
          href={redirectTo}
          className="btn-primary inline-flex rounded-xl px-5 py-2.5 text-sm font-semibold"
        >
          返回并继续
        </Link>
      </div>
    );
  }

  if (!configured) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
        <p className="font-semibold">登录同步尚未配置</p>
        <p className="mt-2 text-xs leading-relaxed text-amber-900/90">
          请在环境变量中设置
          <code className="mx-1 rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_URL</code> 和
          <code className="mx-1 rounded bg-white/80 px-1">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>。
        </p>
        <Link href="/" className="mt-4 inline-block text-sm font-semibold text-blue-700 underline">
          返回首页（无需登录也可使用）
        </Link>
      </div>
    );
  }

  return (
    <EmailOtpLogin
      submitLabel="发送验证码"
      onVerified={() => {
        router.push(redirectTo);
        router.refresh();
      }}
    />
  );
}
