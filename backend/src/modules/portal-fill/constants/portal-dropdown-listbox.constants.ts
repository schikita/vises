/**
 * Kendo DropDownList / ComboBox listbox UI selectors (BirthCountry, PassportType).
 * Selector strings only — no named helper functions (DEC-008).
 */

/** Open control inside `.k-dropdown` / `.k-combobox` chrome. */
export const PORTAL_DROPDOWN_LISTBOX_SELECT_SELECTOR =
  '.k-select, [aria-label="select"]';

/** Host wrappers for RegisterUser Kendo dropdown chrome. */
export const PORTAL_DROPDOWN_WIDGET_HOST_SELECTOR =
  '.k-widget.k-dropdown, .k-dropdown, .k-widget.k-combobox, .k-combobox';

/** Popup list root id pattern: `${fieldName}-list` (data-role=popup). */
export const PORTAL_DROPDOWN_LIST_ID_SUFFIX = '-list';

/** Static listbox id pattern: `${fieldName}_listbox` (aria-owns). */
export const PORTAL_DROPDOWN_LISTBOX_ID_SUFFIX = '_listbox';

/** Filter textbox inside the open popup (filterable DropDownList). */
export const PORTAL_DROPDOWN_LIST_FILTER_SELECTOR =
  '.k-list-filter input.k-textbox, .k-list-filter input[role="listbox"]';

/** Option nodes inside the open listbox. */
export const PORTAL_DROPDOWN_LIST_OPTION_SELECTOR =
  '[role="option"], li.k-item, .k-list-item';
