import path from 'node:path';
import { pathToFileURL } from 'node:url';

/** Normalize a local file path or http(s)/file URL for Patchright goto. */
export function normalizeTargetUrl(target: string): string {
  const t = target.trim();
  if (/^https?:\/\//i.test(t) || /^file:/i.test(t)) return t;
  return pathToFileURL(path.resolve(t)).href;
}
