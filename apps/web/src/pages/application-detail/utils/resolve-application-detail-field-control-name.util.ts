/** Resolve RHF `name` from a bubbled blur/change target (Start sync wiring). */
export const resolveApplicationDetailFieldControlName = (
  target: EventTarget | null,
): string => {
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement
  ) {
    return target.name
  }
  return ''
}
