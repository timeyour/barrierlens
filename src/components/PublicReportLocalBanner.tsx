"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getRecordByLocalId } from "@/lib/recordStore";
import { REVIEW_STATUS_LABELS, type StoredRecord } from "@/types/analysis";

interface PublicReportLocalBannerProps {
  localId: string | null;
}

export default function PublicReportLocalBanner({
  localId,
}: PublicReportLocalBannerProps) {
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshToken((token) => token + 1);
    window.addEventListener("barrierlens-record-saved", refresh);
    return () => window.removeEventListener("barrierlens-record-saved", refresh);
  }, []);

  void refreshToken;
  const local: StoredRecord | null = localId ? getRecordByLocalId(localId) : null;

  if (!local) return null;

  const statusLabel = REVIEW_STATUS_LABELS[local.reviewStatus];

  return (
    <div
      className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs text-blue-900"
      role="status"
    >
      本机跟进：{statusLabel} ·{" "}
      <Link href="/#records" className="font-semibold underline">
        打开记录
      </Link>
    </div>
  );
}
