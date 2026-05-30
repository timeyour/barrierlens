"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  hackathonLegacyQuery,
  resolveHackathonFlagsFromSearch,
  type HackathonFlags,
} from "@/config/hackathonFlags";

export function useHackathonFlags(): HackathonFlags & {
  legacyQuery: string;
  isLegacyMode: boolean;
} {
  const searchParams = useSearchParams();

  return useMemo(() => {
    const search: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      search[key] = value;
    });
    const flags = resolveHackathonFlagsFromSearch(search);
    const isLegacyMode = !(
      flags.obstacleFallback ||
      flags.locationRequired ||
      flags.publicReadOnly ||
      flags.dispatchScript
    );
    return { ...flags, legacyQuery: hackathonLegacyQuery(), isLegacyMode };
  }, [searchParams]);
}
