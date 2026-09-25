import {
  APP_STATUS_NEEDS_FIXES,
  APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT,
  APP_STATUS_SYSTEM_ACTOR,
} from '../constants';
import type { TimelineItem } from '../types';
import type { Application } from '../../database/entities/application.entity';

/**
 * Mutate application to CRM status «Нужны правки» (`fixes`) with a timeline
 * entry when Start / date validation fails. Returns whether status changed.
 */
export const applyApplicationNeedsFixesStatus = (
  app: Application,
  now: Date = new Date(),
): boolean => {
  if (app.status === APP_STATUS_NEEDS_FIXES) {
    return false;
  }

  const timeline = Array.isArray(app.timeline)
    ? ([...app.timeline] as TimelineItem[])
    : [];
  timeline.push({
    at: now.toISOString(),
    text: APP_STATUS_NEEDS_FIXES_TIMELINE_TEXT,
    actor: APP_STATUS_SYSTEM_ACTOR,
  });

  app.status = APP_STATUS_NEEDS_FIXES;
  app.timeline = timeline;
  app.updatedAt = now;
  return true;
};
