import { PORTAL_STATUS_SELECTORS } from '../constants';
import type { PortalFrame, PortalPage } from '../types';
import { isPortalEditMemberFormReadyInContext } from './is-portal-edit-member-form-ready-in-context.util';

type ShellArg = {
  frameSelector: string;
  windowTitle: string;
  urlNeedle: string;
};

/**
 * Resolve Edit Member `iframe.k-content-frame` (prefer title/url over `#popup_N`).
 */
export const resolvePortalEditMemberFrame = async (
  page: PortalPage,
): Promise<PortalFrame | null> => {
  const arg: ShellArg = {
    frameSelector: PORTAL_STATUS_SELECTORS.editMemberFrameSelector,
    windowTitle: PORTAL_STATUS_SELECTORS.editMemberWindowTitle,
    urlNeedle: PORTAL_STATUS_SELECTORS.editMemberFrameUrlNeedle,
  };

  const shellPresent = await page.evaluate((a: ShellArg) => {
    const frames = Array.from(
      document.querySelectorAll(a.frameSelector),
    ) as HTMLIFrameElement[];
    if (frames.length === 0) {
      return false;
    }
    return frames.some((iframe) => {
      const title = (iframe.getAttribute('title') ?? '').trim();
      const src = iframe.getAttribute('src') ?? '';
      if (title === a.windowTitle) return true;
      if (src.includes(a.urlNeedle)) return true;
      return true;
    });
  }, arg);

  if (!shellPresent) {
    return null;
  }

  const needle = PORTAL_STATUS_SELECTORS.editMemberFrameUrlNeedle.toLowerCase();
  const frames = page.frames();
  const urlMatches = frames.filter((frame) =>
    frame.url().toLowerCase().includes(needle),
  );

  const candidates = urlMatches.length > 0 ? urlMatches : frames;

  for (const frame of candidates) {
    try {
      const ready = await isPortalEditMemberFormReadyInContext(frame);
      if (ready) {
        return frame;
      }
    } catch {
      /* cross-origin or not yet loaded */
    }
  }

  return null;
};
