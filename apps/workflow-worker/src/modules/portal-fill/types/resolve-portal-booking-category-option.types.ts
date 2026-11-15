export type ResolvePortalBookingCategoryOptionResult =
  | { kind: 'select'; text: string }
  | { kind: 'premium_staff_stop' }
  | { kind: 'ambiguous' };
