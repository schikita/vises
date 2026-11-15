export type EditMemberFieldCurrentValue = {
  kind: 'text' | 'dropdown' | 'date' | 'radio' | 'checkbox' | 'missing';
  /** Display/text for compare; radio/checkbox use bound value. */
  value: string;
  /** Dropdown bound GUID when available. */
  boundValue?: string;
};
