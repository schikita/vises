/** Read a string property from a loose applicant row; non-strings → undefined. */
export const pickOptionalStringField = (
  record: Record<string, unknown>,
  key: string,
): string | undefined =>
  typeof record[key] === 'string' ? (record[key] as string) : undefined;
