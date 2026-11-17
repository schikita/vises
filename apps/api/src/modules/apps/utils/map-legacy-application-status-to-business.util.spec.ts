import { APPLICATION_STATUSES } from '@vises/contracts';
import { LEGACY_APPLICATION_STATUS_TO_BUSINESS } from './map-legacy-application-status-to-business.constants';
import { mapLegacyApplicationStatusToBusiness } from './map-legacy-application-status-to-business.util';

describe('mapLegacyApplicationStatusToBusiness (§4.D / ASAU-004)', (): void => {
  it('maps every §4.D legacy literal to its BUSINESS target', (): void => {
    for (const [legacy, expected] of Object.entries(
      LEGACY_APPLICATION_STATUS_TO_BUSINESS,
    )) {
      expect(mapLegacyApplicationStatusToBusiness(legacy)).toBe(expected);
    }
  });

  it('returns identity for every already-BUSINESS status', (): void => {
    for (const status of APPLICATION_STATUSES) {
      expect(mapLegacyApplicationStatusToBusiness(status)).toBe(status);
    }
  });

  it('fails loudly on unknown non-BUSINESS literals', (): void => {
    expect((): void => {
      mapLegacyApplicationStatusToBusiness('autofill_running');
    }).toThrow(/Unknown non-BUSINESS application status literal/);

    expect((): void => {
      mapLegacyApplicationStatusToBusiness('');
    }).toThrow(/Unknown non-BUSINESS application status literal/);
  });
});
