import { PORTAL_REGISTER_USER_SELECTORS } from '../constants';
import type { PortalFieldName, PortalPage, WidgetOpResult } from '../types';

export const setTextField = async (
  page: PortalPage,
  name: PortalFieldName,
  value: string,
): Promise<WidgetOpResult> => {
  const selector = PORTAL_REGISTER_USER_SELECTORS.fields[name];
  const count = await page.locator(selector).count();
  if (count === 0) {
    return { ok: false, reason: `${selector} not found` };
  }
  const loc = page.locator(selector).first();
  await loc.fill(value);
  const read = await loc.inputValue();
  return {
    ok: read === value,
    via: 'fill',
    value: read,
    visible: read,
    reason: read === value ? undefined : `read-back mismatch: got "${read}"`,
  };
};
