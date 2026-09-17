/**
 * CapMonster Cloud HTTP shapes for ComplexImage BLS 3×3 (REQ-004 / CON-003).
 */

export type CapMonsterBlsCreateTaskBody = {
  clientKey: string;
  task: {
    type: 'ComplexImageTask';
    class: 'recognition';
    imagesBase64: string[];
    metadata: {
      Task: 'bls_3x3';
      TaskArgument: string;
    };
  };
};

export type CapMonsterCreateTaskResponse = {
  errorId: number;
  errorCode?: string | null;
  errorDescription?: string | null;
  taskId?: number;
};

export type CapMonsterGetTaskResultBody = {
  clientKey: string;
  taskId: number;
};

export type CapMonsterBlsSolution = {
  /** Length-9 boolean cell clicks (index 0–8). */
  answer: boolean[];
  metadata?: {
    AnswerType?: string;
  };
};

export type CapMonsterGetTaskResultResponse = {
  errorId: number;
  errorCode?: string | null;
  errorDescription?: string | null;
  status?: string;
  solution?: CapMonsterBlsSolution;
  cost?: number;
};

export type SolveBls3x3ViaCapMonsterInput = {
  clientKey: string;
  imagesBase64: string[];
  taskArgument: string;
  /** Total create + poll budget (ms). */
  timeoutMs: number;
  /** Poll interval (ms). */
  pollIntervalMs: number;
};

export type SolveBls3x3ViaCapMonsterResult = {
  answer: boolean[];
  taskId: number;
};
