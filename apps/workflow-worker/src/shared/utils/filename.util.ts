/** Sanitize upload basename: alphanumeric + `._-` only (FastAPI parity). */
export const safeFilename = (name: string | undefined | null): string => {
  const raw = name || 'file';
  const safe = [...raw]
    .filter((ch) => /[a-zA-Z0-9._-]/.test(ch))
    .join('');
  return safe || 'file';
};
