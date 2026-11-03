import { afterEach, describe, expect, it, vi } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { cleanup, render, screen, userEvent, within } from '@/shared/testing'
import { i18n } from '@/shared/i18n'
import { ThemeProvider } from '@/shared/theme'
import { ADMIN_NAV, AGENT_NAV } from './constants'
import { ShellLayout } from './ShellLayout'

afterEach((): void => {
  cleanup()
})

const renderShell = async (
  kind: 'admin' | 'agent',
  path: string,
): Promise<ReturnType<typeof userEvent.setup>> => {
  await i18n.changeLanguage('en')
  const user = userEvent.setup()
  const items = kind === 'admin' ? ADMIN_NAV : AGENT_NAV
  const badgeLabel = kind === 'admin' ? 'Admin' : null
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path={kind === 'admin' ? '/admin/*' : '/app/*'}
            element={
              <ShellLayout
                kind={kind}
                items={items}
                badgeLabel={badgeLabel}
                sessionName="Ada Admin"
                sessionLogin="ada"
                onLogout={vi.fn()}
              />
            }
          >
            <Route index element={<div>Home body</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </ThemeProvider>,
  )
  return user
}

describe('ShellLayout (FE14 top nav chrome)', (): void => {
  it('renders sticky top bar with horizontal nav, language, and user menu', async (): Promise<void> => {
    await renderShell('admin', '/admin')

    expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Analytics' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'User menu' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /payment/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /visit/i })).not.toBeInTheDocument()
    expect(document.querySelector('aside')).toBeNull()
  })

  it('exposes theme and logout inside the top-right user menu', async (): Promise<void> => {
    const user = await renderShell('admin', '/admin')

    expect(screen.queryByRole('group', { name: 'Theme' })).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'User menu' }))

    expect(screen.getByRole('group', { name: 'Theme' })).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Log out' })).toBeInTheDocument()
  })

  it('opens responsive drawer from the top bar menu button', async (): Promise<void> => {
    const user = await renderShell('agent', '/app')

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    const openButton = screen.getAllByRole('button', { name: 'Open navigation' }).at(0)
    expect(openButton).toBeTruthy()
    if (!openButton) {
      return
    }
    await user.click(openButton)
    const drawer = screen.getByRole('dialog')
    expect(within(drawer).getByRole('link', { name: 'Balance' })).toBeInTheDocument()
    expect(within(drawer).queryByRole('link', { name: 'Settings' })).not.toBeInTheDocument()
  })
})

describe('ShellLayout responsive chrome (FE14)', (): void => {
  it.each([
    { width: 320, label: 'min' },
    { width: 768, label: 'md' },
    { width: 1280, label: 'xl' },
  ] as const)(
    'keeps sticky top bar and overflow-safe main at $label ($width px)',
    async ({ width }): Promise<void> => {
      Object.defineProperty(window, 'innerWidth', {
        configurable: true,
        writable: true,
        value: width,
      })
      await renderShell('admin', '/admin')

      const topBar = screen.getByRole('banner')
      expect(topBar.className).toContain('sticky')
      expect(screen.getByRole('group', { name: 'Language' })).toBeInTheDocument()
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument()

      const main = document.querySelector('main')
      expect(main).toBeTruthy()
      expect(main?.className).toContain('min-w-0')
      expect(document.querySelector('aside')).toBeNull()
    },
  )
})
