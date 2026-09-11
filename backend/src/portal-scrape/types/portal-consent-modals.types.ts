/** Consent modal step ids in fixed dismiss order (REQ-001). */
export type ConsentModalStepId = 'alertModal' | 'dpModal' | 'Attention';

export type ConsentModalStepOutcome = 'skipped' | 'accepted' | 'failed';

export type ConsentModalStepResult = {
  stepId: ConsentModalStepId;
  outcome: ConsentModalStepOutcome;
  /** Present when outcome is `failed`; names the step (NFR-004). */
  error?: string;
};

export type DismissConsentModalsResult = {
  ok: boolean;
  steps: ConsentModalStepResult[];
  /** Step-identifying error when ok is false (REQ-007 / NFR-004). */
  error?: string;
};
