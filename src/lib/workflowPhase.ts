export type WorkflowPhase = "idle" | "step1" | "step2" | "loading" | "success";

export const WORKFLOW_PHASE_EVENT = "barrierlens:workflow-phase";

export function dispatchWorkflowPhase(phase: WorkflowPhase): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(WORKFLOW_PHASE_EVENT, { detail: phase }),
  );
}

export function resolveWorkflowPhase(input: {
  status: "idle" | "loading" | "success" | "error";
  wizardStep: 1 | 2;
}): WorkflowPhase {
  if (input.status === "loading") return "loading";
  if (input.status === "success") return "success";
  if (input.wizardStep === 2) return "step2";
  if (input.wizardStep === 1) return "step1";
  return "idle";
}

export const FOCUS_PHASES: WorkflowPhase[] = ["step2", "loading", "success"];
