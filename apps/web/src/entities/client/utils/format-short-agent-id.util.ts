/** Short display for agentId when a human name is unavailable (FE17). */
export const formatShortAgentId = (agentId: string): string => {
  const trimmed = agentId.trim()
  if (trimmed.length === 0) {
    return '—'
  }
  if (trimmed.length <= 8) {
    return trimmed
  }
  return `${trimmed.slice(0, 8)}…`
}
