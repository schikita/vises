import { createReadStream } from 'fs';

export const openAppDocumentStream = (
  path: string,
): NodeJS.ReadableStream => createReadStream(path);
