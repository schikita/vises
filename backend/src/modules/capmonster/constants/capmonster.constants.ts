/**
 * CapMonster Cloud HTTP API constants (DEC-001 / CON-003).
 * Raw fetch only — no official SDK dependency.
 */

export const CAPMONSTER_API_BASE_URL = 'https://api.capmonster.cloud';

export const CAPMONSTER_CREATE_TASK_PATH = '/createTask';
export const CAPMONSTER_GET_TASK_RESULT_PATH = '/getTaskResult';

export const CAPMONSTER_TASK_TYPE_COMPLEX_IMAGE = 'ComplexImageTask';
export const CAPMONSTER_TASK_CLASS_RECOGNITION = 'recognition';
export const CAPMONSTER_METADATA_TASK_BLS_3X3 = 'bls_3x3';

/** Expected length of BLS 3×3 image / answer arrays. */
export const CAPMONSTER_BLS_CELL_COUNT = 9;

export const CAPMONSTER_STATUS_READY = 'ready';
export const CAPMONSTER_STATUS_PROCESSING = 'processing';

/** CapMonster createTask + getTaskResult total budget (ms). */
export const PORTAL_CAPMONSTER_TIMEOUT_MS = 120_000;

/** CapMonster getTaskResult poll interval (ms). */
export const PORTAL_CAPMONSTER_POLL_INTERVAL_MS = 2_000;
