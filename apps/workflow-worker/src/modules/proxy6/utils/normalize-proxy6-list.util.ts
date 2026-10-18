/** Normalize Proxy6 `list` object-or-array payloads to an array. */
export const normalizeProxy6List = <T>(
  list: Record<string, T> | T[] | undefined | null,
): T[] => {
  if (list === undefined || list === null) return [];
  if (Array.isArray(list)) return list;
  return Object.values(list);
};
