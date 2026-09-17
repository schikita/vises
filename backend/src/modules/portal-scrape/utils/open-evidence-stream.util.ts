import { createReadStream } from 'fs';

export const openEvidenceStream = (
  absolutePath: string,
): NodeJS.ReadableStream => createReadStream(absolutePath);
