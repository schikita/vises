import { Application } from '../../modules/database/entities/application.entity';

/** FastAPI `extras_out` parity (REQ-002, REQ-012). */
export const extrasOut = (
  app: Application,
): {
  category: string;
  paused: boolean;
  transfer: boolean;
  submitFrom: string;
  submitTo: string;
} => {
  const extras = app.extras || {};
  return {
    category: (extras.category as string) || '',
    paused: Boolean(extras.paused),
    transfer: Boolean(extras.transfer),
    submitFrom: (extras.submitFrom as string) || '',
    submitTo: (extras.submitTo as string) || '',
  };
};
