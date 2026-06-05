"use client";

import { useAuth } from "@/hooks/useAuth";
import { FormEvent, useEffect, useState } from "react";

const RESEND_COOLDOWN_SEC = 60;

type Step = "email" | "code";

interface EmailOtpLoginProps {
  /** 登录成功且已有 user 时由父组件接管展示（如跳转） */
  onVerified?: () => void;
  submitLabel?: string;
  compact?: boolean;
}

export default function EmailOtpLogin({
  onVerified,
  submitLabel = "获取验证码",
  compact = false,
}: EmailOtpLoginProps) {
  const { configured, user, loading, sendEmailOtp, verifyEmailOtp, logout } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cooldownSec, setCooldownSec] = useState(0);

  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = window.setInterval(() => {
      setCooldownSec((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldownSec]);

  useEffect(() => {
    if (user) onVerified?.();
  }, [user, onVerified]);

  if (loading) {
    return <p className="text-sm text-slate-500">正在检查登录状态…</p>;
  }

  if (!configured) {
    return (
      <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900">
        当前未配置云端登录（缺少 NEXT_PUBLIC_SUPABASE_ANON_KEY）。游客模式不受影响。
      </p>
    );
  }

  if (user) {
    return (
      <div className={compact ? "space-y-2" : "space-y-3"}>
        <p className="text-sm text-slate-700">
          已登录：<span className="font-medium">{user.email}</span>
        </p>
        <button
          type="button"
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          onClick={async () => {
            const result = await logout();
            if (!result.ok) setError(result.message);
          }}
        >
          退出登录
        </button>
        {error && <p className="text-xs text-red-700">{error}</p>}
      </div>
    );
  }

  const sendCode = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    const result = await sendEmailOtp(email);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setStep("code");
    setCode("");
    setCooldownSec(RESEND_COOLDOWN_SEC);
    setMessage(
      "验证码已发送到邮箱，请查收（可能在垃圾箱）。若邮件里是登录链接，点击链接也可完成登录。",
    );
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage(null);
    setError(null);
    const result = await verifyEmailOtp(email, code);
    setSubmitting(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setMessage("登录成功。");
  };

  if (step === "code") {
    return (
      <form onSubmit={(event) => void verifyCode(event)} className="space-y-3">
        <p className="text-xs text-slate-600">
          验证码已发送至 <span className="font-medium text-slate-800">{email.trim().toLowerCase()}</span>
        </p>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          value={code}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))}
          placeholder="6 位验证码"
          className="w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-lg tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
          required
          minLength={6}
          maxLength={8}
        />
        <button
          type="submit"
          disabled={submitting || code.length < 6}
          className="btn-primary w-full rounded-xl py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
        >
          {submitting ? "验证中…" : "登录"}
        </button>
        <div className="flex items-center justify-between text-xs">
          <button
            type="button"
            className="text-slate-600 underline hover:text-slate-900"
            onClick={() => {
              setStep("email");
              setMessage(null);
              setError(null);
            }}
          >
            更换邮箱
          </button>
          <button
            type="button"
            className="text-blue-700 underline hover:text-blue-900 disabled:opacity-50"
            disabled={submitting || cooldownSec > 0}
            onClick={async () => {
              setSubmitting(true);
              setError(null);
              const result = await sendEmailOtp(email);
              setSubmitting(false);
              if (!result.ok) setError(result.message);
              else {
                setCooldownSec(RESEND_COOLDOWN_SEC);
                setMessage("验证码已重新发送。");
              }
            }}
          >
            {cooldownSec > 0 ? `${cooldownSec}s 后可重发` : "重新发送"}
          </button>
        </div>
        {message && <p className="text-xs text-emerald-700">{message}</p>}
        {error && <p className="text-xs text-red-700">{error}</p>}
        <p className="text-[11px] leading-relaxed text-slate-500">
          邮件里应是 6 位数字。若只有链接，说明 Supabase 邮件模板仍使用确认链接；可点击链接登录，或在
          Dashboard → Authentication → Email Templates 中改为显示{" "}
          <code className="rounded bg-slate-100 px-1">{"{{ .Token }}"}</code>。
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={(event) => void sendCode(event)} className="space-y-3">
      <input
        type="email"
        autoComplete="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        required
      />
      <button
        type="submit"
        disabled={submitting || cooldownSec > 0}
        className="btn-primary w-full rounded-xl py-3 text-sm font-semibold disabled:cursor-wait disabled:opacity-60"
      >
        {submitting ? "发送中…" : cooldownSec > 0 ? `${cooldownSec}s 后可重发` : submitLabel}
      </button>
      <p className="text-xs leading-relaxed text-slate-500">
        优先发送 6 位验证码，在本页输入后登录。若收到的是邮件链接，点击后也会自动登录。
      </p>
      {message && <p className="text-xs text-emerald-700">{message}</p>}
      {error && <p className="text-xs text-red-700">{error}</p>}
    </form>
  );
}
