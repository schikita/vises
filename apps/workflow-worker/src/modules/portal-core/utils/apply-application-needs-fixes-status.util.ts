import type { Application } from '../../database/entities/application.entity';
import {
  APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT,
  APP_STATUS_SYSTEM_ACTOR,
} from '../constants/app-status-needs-fixes.constants';
import type { TimelineItem } from '../types/timeline-item.types';

/**
 * Append a «Нужны правки» timeline note when Start / date validation fails.
 *
 * Does **not** mutate `Application.status` — `'fixes'` is outside the
 * ApplicationStatus union (FR-7). Status remapping belongs to applications T9.
 * Returns whether a timeline entry was appended.
 */
export const applyApplicationNeedsFixesStatus = (
  app: Application,
  now: Date = new Date(),
): boolean => {
  const timeline = Array.isArray(app.timeline)
    ? ([...app.timeline] as TimelineItem[])
    : [];
  const alreadyNoted = timeline.some(
    (item) => item.text === APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT,
  );
  if (alreadyNoted) {
    return false;
  }

  timeline.push({
    at: now.toISOString(),
    text: APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT,
    actor: APP_STATUS_SYSTEM_ACTOR,
  });

  app.timeline = timeline;
  app.updatedAt = now;
  return true;
};
