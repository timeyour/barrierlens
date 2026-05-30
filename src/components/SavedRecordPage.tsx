"use client";

import Link from "next/link";
import PageBackground from "@/components/PageBackground";
import SavedRecordArchive from "@/components/SavedRecordArchive";
import SiteNav from "@/components/SiteNav";
import { getRecordByLocalId } from "@/lib/recordStore";
import type { StoredRecord } from "@/types/analysis";
import { use, useEffect, useState } from "react";

export default function SavedRecordPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [refreshToken, setRefreshToken] = useState(0);
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- mark client store ready on mount
    setBootstrapped(true);
    const onSave = () => setRefreshToken((token) => token + 1);
    window.addEventListener("barrierlens-record-saved", onSave);
    return () => window.removeEventListener("barrierlens-record-saved", onSave);
  }, [id]);

  void refreshToken;
  const record: StoredRecord | null | undefined = !bootstrapped
    ? undefined
    : getRecordByLocalId(id);

  if (record === undefined) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <SiteNav />
        <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-24 md:px-6">
          <p className="text-sm text-slate-500">正在加载本机档案…</p>
        </main>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="relative min-h-screen">
        <PageBackground />
        <SiteNav />
        <main className="relative mx-auto max-w-3xl px-4 pb-16 pt-24 md:px-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-950">
            <p className="font-semibold">未找到保存档案</p>
            <p className="mt-1 text-amber-900/90">仅保存在当前浏览器</p>
          </div>
          <Link href="/#records" className="mt-6 inline-block text-sm font-semibold text-blue-700">
            返回时间线
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <PageBackground />
      <SiteNav />
      <main className="relative mx-auto max-w-4xl px-4 pb-16 pt-24 md:px-6">
        <SavedRecordArchive record={record} />
      </main>
    </div>
  );
}
