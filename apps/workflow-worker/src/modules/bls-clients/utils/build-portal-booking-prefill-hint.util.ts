import type { Application } from '../../database/entities/application.entity';
import type { PortalBookingPrefillHint } from '../../portal-fill/types/portal-booking.types';
import { readApplicationExtrasCategory } from './read-application-extras-category.util';

/**
 * CRM → PortalBookingPrefillHint (REQ-006 / DEC-003 / ASSUME-003).
 * applicantCount drives Appointment For / members; category + visaSubType
 * only when present — never invented.
 */
export const buildPortalBookingPrefillHint = (
  app: Application,
  applicantCount: number,
): PortalBookingPrefillHint => {
  const submitCity = app.submitCity?.trim() || undefined;
  const visaType = app.visaType?.trim() || undefined;
  const visaSubType = app.visaSubType?.trim() || undefined;
  const category = readApplicationExtrasCategory(app.extras);

  return {
    ...(submitCity !== undefined ? { submitCity } : {}),
    ...(visaType !== undefined ? { visaType } : {}),
    ...(visaSubType !== undefined ? { visaSubType } : {}),
    ...(category !== undefined ? { category } : {}),
    applicantCount,
  };
};
