"use client";

import EmailOtpLogin from "@/components/EmailOtpLogin";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">登录同步记录</h3>
            <p className="mt-1 text-xs text-slate-600">
              登录后可同步记录；不登录也可使用核心功能。
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            关闭
          </button>
        </div>

        <EmailOtpLogin compact submitLabel="获取验证码" onVerified={onClose} />
      </div>
    </div>
  );
}
