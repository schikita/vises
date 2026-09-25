/**
 * Register a force-close hook with the workflow abort registry without
 * clients importing the registry type (cycle break / DEC-001).
 */
export type BlsClientRegisterCloseHook = (
  close: () => Promise<void>,
) => void;

/**
 * Shared context passed from the workflow executor into domain BLS clients.
 * Same shape as the runner executor input (DEC-008) — clients own page work only.
 */
export type BlsClientTaskContext = {
  workflowId: string;
  applicationId: string;
  stepId: string;
  stepKey: string;
  taskId: string;
  taskKey: string;
  applicantId: string | null;
  /** 1-based attempt number for this execution. */
  attemptNo: number;
  /**
   * In-flight abort signal from the runner abort registry (DEC-001).
   * Optional so stubs / non-workflow callers remain compatible.
   */
  abortSignal?: AbortSignal;
  /**
   * Callback to register browser close with the abort registry.
   * Provided by the workflow executor — clients must not inject the registry.
   */
  registerCloseHook?: BlsClientRegisterCloseHook;
};
