"use client";

import { formatAuthError } from "@/lib/authErrors";
import { getAuthCallbackUrl } from "@/lib/siteUrl";
import { getSupabaseBrowserClient, isSupabaseAuthConfigured } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

type AuthResult = { ok: true } | { ok: false; message: string };
type LogoutResult = { ok: true } | { ok: false; message: string };

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const configured = isSupabaseAuthConfigured();
  const [loading, setLoading] = useState(configured);
  const client = useMemo(() => getSupabaseBrowserClient(), []);

  useEffect(() => {
    if (!configured || !client) return;

    void client.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [client, configured]);

  const sendEmailOtp = useCallback(
    async (email: string): Promise<AuthResult> => {
      if (!configured || !client) {
        return { ok: false, message: "未配置 Supabase 登录，请稍后重试。" };
      }
      const normalized = normalizeEmail(email);
      if (!normalized) return { ok: false, message: "请输入邮箱地址。" };

      const { error } = await client.auth.signInWithOtp({
        email: normalized,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: getAuthCallbackUrl(),
        },
      });
      if (error) {
        return { ok: false, message: formatAuthError(error.message) };
      }
      return { ok: true };
    },
    [client, configured],
  );

  const verifyEmailOtp = useCallback(
    async (email: string, token: string): Promise<AuthResult> => {
      if (!configured || !client) {
        return { ok: false, message: "未配置 Supabase 登录，请稍后重试。" };
      }
      const normalized = normalizeEmail(email);
      const code = token.replace(/\D/g, "").trim();
      if (!normalized) return { ok: false, message: "请输入邮箱地址。" };
      if (code.length < 6) return { ok: false, message: "请输入邮箱中的 6 位验证码。" };

      const { error } = await client.auth.verifyOtp({
        email: normalized,
        token: code,
        type: "email",
      });
      if (error) {
        return { ok: false, message: formatAuthError(error.message) };
      }
      return { ok: true };
    },
    [client, configured],
  );

  const logout = useCallback(async (): Promise<LogoutResult> => {
    if (!configured || !client) return { ok: true };
    const { error } = await client.auth.signOut();
    if (error) return { ok: false, message: error.message || "退出失败，请稍后重试。" };
    return { ok: true };
  }, [client, configured]);

  return {
    user,
    loading,
    configured,
    sendEmailOtp,
    verifyEmailOtp,
    logout,
  };
}
