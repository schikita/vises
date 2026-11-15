import type {
  PortalWidgetFieldName,
  PortalWidgetSurface,
  WidgetOpResult,
} from '../types';
import { resolvePortalFieldSelector } from './resolve-portal-field-selector.util';

export const setTextField = async (
  surface: PortalWidgetSurface,
  name: PortalWidgetFieldName,
  value: string,
): Promise<WidgetOpResult> => {
  const selector = resolvePortalFieldSelector(name);
  const count = await surface.locator(selector).count();
  if (count === 0) {
    return { ok: false, reason: `${selector} not found` };
  }
  const loc = surface.locator(selector).first();
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
