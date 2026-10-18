/** Convert string id list to Proxy6 comma-separated `ids` query value. */
export const joinProxy6Ids = (ids: string[]): string =>
  ids.map((id) => id.trim()).filter((id) => id !== '').join(',');
