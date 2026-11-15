import type { ReactElement } from 'react'
import type { PortalFormToggleBannerProps } from '../../types/portal-form-toggle-banner.types'
import { PortalFormSectionBanner } from '../PortalFormSectionBanner'

/**
 * Checkbox + numbered banner for site conditionals (sections 2 / 5 / 8).
 * Reuses PortalFormSectionBanner for the gold banner chrome.
 */
export const PortalFormToggleBanner = ({
  number,
  title,
  checkboxId,
  checked,
  name,
  onBlur,
  onChange,
  inputRef,
  controlsId,
}: PortalFormToggleBannerProps): ReactElement => {
  return (
    <div className="portal-form-toggle-banner">
      <input
        id={checkboxId}
        type="checkbox"
        className="portal-form-toggle-banner-input"
        name={name}
        checked={checked}
        onBlur={onBlur}
        onChange={onChange}
        ref={inputRef}
        aria-controls={controlsId}
      />
      <label htmlFor={checkboxId} className="portal-form-toggle-banner-label">
        <PortalFormSectionBanner number={number} title={title} />
      </label>
    </div>
  )
}
