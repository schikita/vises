/**
 * Site adapter match / probe context (REQ-015 / REQ-016 / DEC-009).
 * Keep thin — adapters own selectors and optional outcome probing.
 */

export type PortalSiteAdapterMatchContext = {
  submitCountry: string;
};
