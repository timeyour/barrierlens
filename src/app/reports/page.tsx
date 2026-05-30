import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import PublicReportCard from "@/components/PublicReportCard";
import PublicReportReadOnlyBanner from "@/components/PublicReportReadOnlyBanner";
import SiteNav from "@/components/SiteNav";
import { isHackathonFlagEnabled } from "@/config/hackathonFlags";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { listCloudReports } from "@/lib/supabase/reports";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const configured = isSupabaseConfigured();
  const reports = configured ? await listCloudReports(30) : [];
  const publicReadOnly = isHackathonFlagEnabled("publicReadOnly");

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <SiteNav />
      <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-24 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">公开记录</h1>
          <p className="mt-2 text-sm text-slate-600">
            {publicReadOnly ? "只读快照 · 不代表已结案" : "大家上报的无障碍现场"}
          </p>
        </div>

        {publicReadOnly && (
          <div className="mb-6">
            <PublicReportReadOnlyBanner enabled />
          </div>
        )}

        {!configured && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            公开池未配置 · 本机记录仍可用
          </div>
        )}

        {configured && reports.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-700">暂无公开记录</p>
            <Link
              href="/#tool"
              className="btn-primary mt-6 inline-flex rounded-xl px-5 py-3 text-sm font-semibold"
            >
              去拍照
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
          <Link href="/" className="text-sm font-medium text-blue-700 hover:text-blue-900">
            ← 首页
          </Link>
        </div>
      </main>
    </div>
  );
}
