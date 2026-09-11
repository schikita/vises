import type { UpsertAppDto } from '../dto/upsert-app.dto';

/** Map optional upsert extras fields into the JSON `extras` column shape. */
export const extrasIn = (body: UpsertAppDto): Record<string, unknown> => ({
  category: body.category ?? '',
  paused: Boolean(body.paused),
  transfer: Boolean(body.transfer),
  submitFrom: body.submitFrom ?? '',
  submitTo: body.submitTo ?? '',
});
