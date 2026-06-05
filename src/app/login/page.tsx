import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "@/components/LoginForm";
import PageBackground from "@/components/PageBackground";
import SiteNav from "@/components/SiteNav";

export default function LoginPage() {
  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <SiteNav />
      <main className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 pb-16 pt-24 md:px-6">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-6 shadow-lg backdrop-blur-sm sm:p-8">
          <h1 className="text-2xl font-bold text-slate-900">登录同步记录</h1>
          <p className="mt-2 text-sm text-slate-600">登录后可多设备查看；不登录也可完整使用 Demo</p>
          <div className="mt-6">
            <Suspense fallback={<p className="text-sm text-slate-500">加载中…</p>}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-slate-500">
          <Link href="/" className="font-medium text-blue-700 hover:underline">
            跳过，直接用
          </Link>
        </p>
      </main>
    </div>
  );
}
