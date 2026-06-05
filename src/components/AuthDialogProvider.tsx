"use client";

import AuthModal from "@/components/AuthModal";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface AuthDialogContextValue {
  openAuthDialog: () => void;
  closeAuthDialog: () => void;
}

const AuthDialogContext = createContext<AuthDialogContextValue | null>(null);

export function AuthDialogProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const openAuthDialog = useCallback(() => setOpen(true), []);
  const closeAuthDialog = useCallback(() => setOpen(false), []);

  const value = useMemo(
    () => ({ openAuthDialog, closeAuthDialog }),
    [openAuthDialog, closeAuthDialog],
  );

  return (
    <AuthDialogContext.Provider value={value}>
      {children}
      <AuthModal open={open} onClose={closeAuthDialog} />
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
