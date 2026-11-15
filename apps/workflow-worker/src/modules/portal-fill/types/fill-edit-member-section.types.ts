import type { EditMemberFieldPlanEntry } from './edit-member-fill-input.types';
import type { EditMemberFillSectionId } from '../constants/edit-member-section.constants';
import type { PortalStatusFieldProgress } from './portal-status-checkpoint.types';
import type { PortalWidgetSurface } from './portal-widget-surface.types';

export type FillEditMemberSectionOptions = {
  surface: PortalWidgetSurface;
  sectionId: EditMemberFillSectionId;
  fields: EditMemberFieldPlanEntry[];
  fieldProgress: PortalStatusFieldProgress;
  priorFilledIds: ReadonlySet<string>;
};

export type FillEditMemberSectionResult =
  | {
      ok: true;
      fieldProgress: PortalStatusFieldProgress;
      filled: string[];
      skipped: string[];
    }
  | {
      ok: false;
      fieldProgress: PortalStatusFieldProgress;
      reason: string;
      reasonCode?: string;
      notSafe?: boolean;
      failedFieldId?: string;
    };
