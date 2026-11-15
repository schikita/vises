/** Null / blank Client plaintext → omit from ApplicantInput (never invent). */
export const optionalClientPlaintext = (
  value: string | null | undefined,
): string | undefined => {
  if (value == null) {
    return undefined;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};
