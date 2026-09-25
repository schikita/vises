/**
 * Pick a random domain label from non-empty dropdown texts (REQ-009).
 * Throws when the list is empty (fail closed — no invented domains).
 */
export const pickRandomBrowserMailDomainOption = (
  domainLabels: string[],
): string => {
  const cleaned = domainLabels
    .map((label) => label.trim().replace(/^@/, ''))
    .filter((label) => label.length > 0);
  if (cleaned.length === 0) {
    throw new Error('browser_mail_domain_dropdown_empty');
  }
  const index = Math.floor(Math.random() * cleaned.length);
  return cleaned[index] ?? cleaned[0]!;
};
