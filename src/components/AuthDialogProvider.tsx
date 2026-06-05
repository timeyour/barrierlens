"use client";

import AuthModal from "@/components/AuthModal";
import { WORKFLOW_PHASE_EVENT, type WorkflowPhase } from "@/lib/workflowPhase";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthDialogContextValue {
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

/** 进入记录步骤 2 / 分析 / 结果时自动关闭登录弹窗，避免挡住工作台 */
const AUTO_CLOSE_PHASES: WorkflowPhase[] = ["step2", "loading", "success"];

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedOnPath, setOpenedOnPath] = useState<string | null>(null);

  const openAuthDialog = useCallback(() => {
    setOpenedOnPath(pathname);
    setOpen(true);
  }, [pathname]);

  const closeAuthDialog = useCallback(() => {
    setOpen(false);
    setOpenedOnPath(null);
  }, []);

  const isOpen = open && openedOnPath === pathname;

  useEffect(() => {
    if (!isOpen) return;

    const onPhase = (event: Event) => {
      const phase = (event as CustomEvent<WorkflowPhase>).detail;
      if (phase && AUTO_CLOSE_PHASES.includes(phase)) {
        closeAuthDialog();
      }
    };

    window.addEventListener(WORKFLOW_PHASE_EVENT, onPhase);
    return () => window.removeEventListener(WORKFLOW_PHASE_EVENT, onPhase);
  }, [isOpen, closeAuthDialog]);

  const value = useMemo(
    () => ({ openAuthDialog, closeAuthDialog }),
    [openAuthDialog, closeAuthDialog],
  );

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <AuthModal open={isOpen} onClose={closeAuthDialog} />
    </AuthDialogContext.Provider>
  );
}

export function useAuthDialog(): AuthDialogContextValue {
  const value = useContext(AuthDialogContext);
  if (!value) {
    throw new Error("useAuthDialog must be used within AuthDialogProvider");
  }
  return value;
}
