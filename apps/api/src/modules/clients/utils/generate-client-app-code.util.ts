import {
  CLIENT_APP_CODE_BASE,
  CLIENT_APP_CODE_PREFIX,
  CLIENT_APP_CODE_RANGE,
} from '../constants';

/** Generate application code for a client-create txn (`VS-2400`…`VS-2899`). */
export const generateClientAppCode = (): string =>
  `${CLIENT_APP_CODE_PREFIX}${CLIENT_APP_CODE_BASE + Math.floor(Math.random() * CLIENT_APP_CODE_RANGE)}`;
