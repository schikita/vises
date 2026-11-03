import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  SHELL_NAV_LINK_ACTIVE_CLASS,
  SHELL_NAV_LINK_BASE_CLASS,
  SHELL_NAV_LINK_INACTIVE_CLASS,
  SHELL_NAV_LIST_HORIZONTAL_CLASS,
  SHELL_NAV_LIST_VERTICAL_CLASS,
} from './constants'
import type { ShellNavListProps } from './types'

export const ShellNavList = ({
  items,
  orientation = 'vertical',
  onNavigate,
}: ShellNavListProps): React.ReactElement => {
  const { t } = useTranslation()
  const listClass =
    orientation === 'horizontal'
      ? SHELL_NAV_LIST_HORIZONTAL_CLASS
      : SHELL_NAV_LIST_VERTICAL_CLASS

  return (
    <ul className={listClass}>
      {items.map((item) => (
        <li key={item.to}>
          <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }): string =>
              `${SHELL_NAV_LINK_BASE_CLASS} ${
                isActive ? SHELL_NAV_LINK_ACTIVE_CLASS : SHELL_NAV_LINK_INACTIVE_CLASS
              }`
            }
          >
            <item.icon size={16} aria-hidden />
            {t(item.labelKey)}
          </NavLink>
        </li>
      ))}
    </ul>
  )
}
