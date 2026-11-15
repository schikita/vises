import type { PortalDomContext } from '../types/portal-dom-context.types';
import { isPortalEditMemberFormReadyInContext } from './is-portal-edit-member-form-ready-in-context.util';

/**
 * True when the Edit Member / ManageApplicant form is visible
 * (`edit_app.html` cues) in the given page or iframe context.
 */
export const isPortalApplicantEditFormVisible = async (
  context: PortalDomContext,
): Promise<boolean> => isPortalEditMemberFormReadyInContext(context);
