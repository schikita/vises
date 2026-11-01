import { Setting } from '../../modules/database/entities/setting.entity';
import { settingsOut } from './settings.mapper';

describe('settingsOut mapper (AC-4 / FR-3)', (): void => {
  it('exposes price_per_client from Setting.defaultPrice as a decimal string', (): void => {
    const setting = new Setting();
    setting.id = 1;
    setting.company = 'Vises';
    setting.defaultPrice = 180;
    setting.cities = ['Minsk'];
    setting.destinations = ['ES'];
    setting.emailOtpEnabled = false;

    const out = settingsOut(setting, true);

    expect(out.price_per_client).toBe('180.00');
    expect(out.company).toBe('Vises');
    expect(out.cities).toEqual(['Minsk']);
    expect(out.destinations).toEqual(['ES']);
    expect(out.emailOtpEnabled).toBe(false);
    expect(out.demoControlsEnabled).toBe(true);
    expect(out).not.toHaveProperty('defaultPrice');
  });
});
