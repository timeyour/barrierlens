import Link from "next/link";
import { notFound } from "next/navigation";
import PageBackground from "@/components/PageBackground";
import ReportPublicDetail from "@/components/ReportPublicDetail";
import SiteNav from "@/components/SiteNav";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { getCloudReport } from "@/lib/supabase/reports";

export const dynamic = "force-dynamic";

export default async function ReportDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured()) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <SiteNav />
        <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-24 md:px-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            云端详情未配置 Supabase。
          </div>
          <Link href="/reports" className="mt-6 inline-block text-sm text-blue-700">
            返回列表
          </Link>
        </main>
      </div>
    );
  }

  const report = await getCloudReport(id);
  if (!report) notFound();

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <SiteNav />
      <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-24 md:px-6">
        <ReportPublicDetail report={report} />
      </main>
    </div>
  );
}
