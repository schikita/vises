import type { CSSProperties, ReactElement } from 'react'
import { PORTAL_FORM_THEME } from '../../constants/portal-form-theme.constants'
import type { PortalFormShellProps } from '../../types/portal-form-shell.types'

export const PortalFormShell = ({
  children,
  title,
}: PortalFormShellProps): ReactElement => {
  const themeVars = {
    '--portal-bg': PORTAL_FORM_THEME.background,
    '--portal-surface': PORTAL_FORM_THEME.surface,
    '--portal-surface-raised': PORTAL_FORM_THEME.surfaceRaised,
    '--portal-border': PORTAL_FORM_THEME.border,
    '--portal-text': PORTAL_FORM_THEME.text,
    '--portal-text-muted': PORTAL_FORM_THEME.textMuted,
    '--portal-gold': PORTAL_FORM_THEME.gold,
    '--portal-gold-banner-bg': PORTAL_FORM_THEME.goldBannerBg,
    '--portal-gold-banner-border': PORTAL_FORM_THEME.goldBannerBorder,
    '--portal-required': PORTAL_FORM_THEME.required,
    '--portal-field-bg': PORTAL_FORM_THEME.fieldBg,
    '--portal-field-border': PORTAL_FORM_THEME.fieldBorder,
    '--portal-field-focus': PORTAL_FORM_THEME.fieldFocus,
  } as CSSProperties

  return (
    <div className="portal-form-shell" style={themeVars}>
      <div className="portal-form-shell-card">
        {title ? (
          <div className="portal-form-shell-header">
            <h2 className="portal-form-shell-title">{title}</h2>
          </div>
        ) : null}
        <div className="portal-form-shell-body">{children}</div>
      </div>
    </div>
  )
}
