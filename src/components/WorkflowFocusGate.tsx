"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  FOCUS_PHASES,
  WORKFLOW_PHASE_EVENT,
  type WorkflowPhase,
} from "@/lib/workflowPhase";

interface WorkflowFocusGateProps {
  children: ReactNode;
  hideOn?: WorkflowPhase[];
}

export default function WorkflowFocusGate({
  children,
  hideOn = FOCUS_PHASES,
}: WorkflowFocusGateProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onPhase = (event: Event) => {
      const detail = (event as CustomEvent<WorkflowPhase>).detail;
      if (detail) setHidden(hideOn.includes(detail));
    };
    window.addEventListener(WORKFLOW_PHASE_EVENT, onPhase);
    return () => window.removeEventListener(WORKFLOW_PHASE_EVENT, onPhase);
  }, [hideOn]);

  if (hidden) return null;
  return children;
}
