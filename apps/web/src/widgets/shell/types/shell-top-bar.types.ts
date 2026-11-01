export type ShellTopBarProps = {
  sessionName?: string
  sessionLogin?: string
  drawerOpen: boolean
  onToggleDrawer: () => void
  onLogout: () => void
}
