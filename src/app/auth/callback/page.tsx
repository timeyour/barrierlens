"use client";

import PageBackground from "@/components/PageBackground";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("正在完成登录…");

  useEffect(() => {
    const next = searchParams.get("next") || "/";
    const code = searchParams.get("code");

    async function finish() {
      const client = getSupabaseBrowserClient();
      if (!client) {
        setMessage("登录尚未配置，请返回首页继续使用。");
        window.setTimeout(() => router.replace("/"), 2500);
        return;
      }

      if (code) {
        const { error } = await client.auth.exchangeCodeForSession(code);
        if (error) {
          setMessage("登录链接无效或已过期，请重新获取验证码。");
          window.setTimeout(() => router.replace("/login"), 2500);
          return;
        }
        router.replace(next);
        router.refresh();
        return;
      }

      const {
        data: { session },
      } = await client.auth.getSession();
      if (session) {
        router.replace(next);
        router.refresh();
        return;
      }

      setMessage("未能完成登录，请重新获取验证码或点击邮件中的最新链接。");
      window.setTimeout(() => router.replace("/login"), 2500);
    }

    void finish();
  }, [router, searchParams]);

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <p className="rounded-xl border border-slate-200 bg-white/95 px-5 py-4 text-sm text-slate-700 shadow-lg">
        {message}
      </p>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <Suspense
        fallback={
          <main className="flex min-h-screen items-center justify-center px-4">
            <p className="text-sm text-slate-600">正在完成登录…</p>
          </main>
        }
      >
        <AuthCallbackInner />
      </Suspense>
    </div>
  );
}
