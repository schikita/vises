/**
 * Application upsert write fields for FE/API alignment (REQ-003 / DEC-003).
 * Companion to Nest `UpsertAppDto` — contracts SoT for `visaSubType` only;
 * Nest remains the full upsert class until APF-TASK-003 mirrors this field.
 */
export type ApplicationUpsertDto = {
  /**
   * Portal Visa Sub Type label/text for booking prefill.
   * Maps to `applications.visa_sub_type`.
   */
  visaSubType?: string;
};
