export const stripDataUriPrefix = (raw: string): string => {
  const marker = ';base64,';
  const idx = raw.indexOf(marker);
  if (idx >= 0) {
    return raw.slice(idx + marker.length);
  }
  return raw;
};
