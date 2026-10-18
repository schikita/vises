import { CAPMONSTER_BLS_CELL_COUNT } from '../constants';

export const assertNineRawBase64 = (imagesBase64: string[]): void => {
  if (imagesBase64.length !== CAPMONSTER_BLS_CELL_COUNT) {
    throw new Error(
      `CapMonster BLS requires exactly ${CAPMONSTER_BLS_CELL_COUNT} images; got ${imagesBase64.length}`,
    );
  }
  for (let i = 0; i < imagesBase64.length; i += 1) {
    const img = imagesBase64[i];
    if (typeof img !== 'string' || img.trim() === '') {
      throw new Error(`CapMonster image[${i}] is empty or not a string`);
    }
    if (img.includes('data:') || img.includes(';base64,')) {
      throw new Error(
        `CapMonster image[${i}] must be raw base64 without data-URI prefix`,
      );
    }
  }
};
