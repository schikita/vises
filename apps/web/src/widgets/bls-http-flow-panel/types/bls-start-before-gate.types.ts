/** Options passed from panel Start / supersede into the parent pre-gate (DEC-004). */
export type BeforeStartBlsHttpWorkflowOptions = {
  supersede: boolean
}

/**
 * Parent-owned gate: `true` = panel may call start API; `false` = stop (REQ-004).
 */
export type BeforeStartBlsHttpWorkflow = (
  options: BeforeStartBlsHttpWorkflowOptions,
) => Promise<boolean>
