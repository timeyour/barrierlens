"use client";

import EmailOtpLogin from "@/components/EmailOtpLogin";
import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
}

function subscribeNoop() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function AuthModal({ open, onClose }: AuthModalProps) {
  const mounted = useSyncExternalStore(subscribeNoop, getClientSnapshot, getServerSnapshot);
  const handleVerified = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  if (!open || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 id="auth-modal-title" className="text-base font-semibold text-slate-900">
              登录同步记录
            </h3>
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

        <EmailOtpLogin compact submitLabel="获取验证码" onVerified={handleVerified} />
      </div>
    </div>,
    document.body,
  );
}
