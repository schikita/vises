/**
 * Agent display name for client list rows (DEC-P12).
 * Prefer non-empty `User.name`; otherwise `login`.
 */
export const resolveAgentDisplayName = (agent: {
  name: string;
  login: string;
}): string => {
  const trimmed = (agent.name ?? '').trim();
  if (trimmed !== '') {
    return trimmed;
  }
  return agent.login;
};
