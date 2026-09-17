import { existsSync } from 'fs';

export const appDocumentExists = (path: string): boolean => existsSync(path);
