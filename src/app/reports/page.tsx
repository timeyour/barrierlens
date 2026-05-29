import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import PublicReportCard from "@/components/PublicReportCard";
import SiteNav from "@/components/SiteNav";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listCloudReports } from "@/lib/supabase/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const configured = isSupabaseConfigured();
  const reports = configured ? await listCloudReports(30) : [];

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <SiteNav />
      <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-24 md:px-6">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            公开上报池
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">最近上报</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
            公众与物业自查提交的无障碍通行风险记录。照片经 AI 结构化后可被查看、分享与跟进。
          </p>
        </div>

        {!configured && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            云端列表尚未配置 Supabase。本机「时间线」仍可用；配置方法见{" "}
            <code className="rounded bg-amber-100 px-1">docs/supabase-setup.sql</code>。
          </div>
        )}

        {configured && reports.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">还没有公开上报</p>
            <p className="mt-2 text-sm text-slate-500">
              完成一次现场记录后，会自动同步到这里。
            </p>
            <Link
              href="/#tool"
              className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-semibold"
            >
              开始第一次上报
            </Link>
          </div>
        )}

        {reports.length > 0 && (
          <ul className="space-y-4">
            {reports.map((report) => (
              <li key={report.id}>
                <PublicReportCard report={report} />
              </li>
            ))}
          </ul>
        )}

        <div className="mt-10">
          <Link
            href="/"
            className="text-sm font-medium text-blue-700 hover:text-blue-900"
          >
            ← 返回首页
          </Link>
        </div>
      </main>
    </div>
  );
}
