import { join } from 'path';

export const resolveAppDocumentPath = (
  uploadDir: string,
  appId: string,
  stored: string,
): string => join(uploadDir, appId, stored);
