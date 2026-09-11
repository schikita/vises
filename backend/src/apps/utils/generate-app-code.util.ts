import {
  APP_CODE_BASE,
  APP_CODE_PREFIX,
  APP_CODE_RANGE,
} from '../constants';

/** Generate a new application code (`VS-2400`…`VS-2899`). */
export const generateAppCode = (): string =>
  `${APP_CODE_PREFIX}${APP_CODE_BASE + Math.floor(Math.random() * APP_CODE_RANGE)}`;
