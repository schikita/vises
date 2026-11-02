/**

 * Parent callback when start/supersede API fails with a readable detail (DEC-006).

 * Parent opens the shared Start Dialog; panel may also keep inline `actionError`.

 */

export type OnStartBlsHttpWorkflowApiError = (detail: string) => void


