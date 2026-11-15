import type { EditMemberFieldPlanEntry } from './edit-member-fill-input.types';
import type { PortalStatusFieldProgress } from './portal-status-checkpoint.types';
import type { PortalWidgetSurface } from './portal-widget-surface.types';

export type ApplyEditMemberPlanFieldOptions = {
  surface: PortalWidgetSurface;
  entry: EditMemberFieldPlanEntry;
  fieldProgress: PortalStatusFieldProgress;
  /** Field ids already filled in a prior checkpoint (resume). */
  priorFilledIds: ReadonlySet<string>;
};

export type ApplyEditMemberPlanFieldResult =
  | { ok: true; fieldProgress: PortalStatusFieldProgress; outcome: 'filled' | 'skipped' }
  | {
      ok: false;
      fieldProgress: PortalStatusFieldProgress;
      reason: string;
      reasonCode: string;
      notSafe?: boolean;
    };
