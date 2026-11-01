/**
 * Map `Setting.defaultPrice` (int) to API `price_per_client` decimal string (NFR-1 / FR-3).
 */
export const formatPricePerClient = (defaultPrice: number): string => {
  return `${defaultPrice}.00`;
};
