import { describe, expect, it } from 'vitest'
import { formatIssuedAccessClipboard } from './format-issued-access-clipboard.util'

describe('formatIssuedAccessClipboard', (): void => {
  it('joins labeled login, password, and link without logging', (): void => {
    const text = formatIssuedAccessClipboard({
      loginLabel: 'Login',
      passwordLabel: 'Password',
      login: 'client@example.com',
      password: 'one-time',
      link: 'https://example.test/invite/tok',
    })
    expect(text).toBe(
      'Login: client@example.com\nPassword: one-time\nhttps://example.test/invite/tok',
    )
  })
})
