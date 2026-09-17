import { z } from 'zod';

/**
 * Full backend env bag validated at Nest boot (ConfigModule.validate).
 * Keys must be present (may be empty string where operators fill later).
 */
export const appEnvSchema = z.object({
  NODE_ENV: z.string(),
  POSTGRES_USER: z.string(),
  POSTGRES_PASSWORD: z.string(),
  POSTGRES_DB: z.string(),
  DATABASE_URL: z.string(),
  JWT_SECRET: z.string(),
  DEMO_AUTH_ENABLED: z.string(),
  UPLOAD_DIR: z.string(),
  VISES_PORTAL_BASE_URL: z.string(),
  VISES_PORTAL_REGISTER_PATH: z.string(),
  CAPMONSTER_API_KEY: z.string(),
  /** Empty ⇒ MailSlurp OTP path off (REQ-013 / REQ-001). */
  MAILSLURP_API_KEY: z.string(),
  WEBSHARE_API_KEY: z.string(),
  /**
   * Empty ⇒ default 60000 ms. List cache TTL: when elapsed (or plan/key
   * changes / free pool empty), refresh usable proxy inventory from Webshare.
   */
  WEBSHARE_PROXY_LIST_TTL_MS: z.string(),
});
