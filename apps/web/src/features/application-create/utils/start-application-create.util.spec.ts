import { describe, expect, it, vi } from 'vitest'
import type { AppUpsertWrite, UpsertAppResult } from '@/entities/application'
import { APPLICATION_CREATE_WRITE } from '../constants'
import { startApplicationCreate } from './start-application-create.util'

const result = { id: 'app-1', clientId: 'cli-1' } as UpsertAppResult

describe('startApplicationCreate', (): void => {
  it('shares one upsert while the first create is still running', async (): Promise<void> => {
    let resolveUpsert: (value: UpsertAppResult) => void = (): void => undefined
    const upsert = vi.fn(
      (): Promise<UpsertAppResult> =>
        new Promise((resolve): void => {
          resolveUpsert = resolve
        }),
    )

    const first = startApplicationCreate(upsert)
    const second = startApplicationCreate(upsert)
    resolveUpsert(result)

    await expect(first).resolves.toBe(result)
    await expect(second).resolves.toBe(result)
    expect(upsert).toHaveBeenCalledTimes(1)
    expect(upsert).toHaveBeenCalledWith(APPLICATION_CREATE_WRITE)
  })

  it('starts a new create after the previous one settles', async (): Promise<void> => {
    const upsert = vi.fn(
      async (_app: AppUpsertWrite): Promise<UpsertAppResult> => result,
    )

    await startApplicationCreate(upsert)
    await startApplicationCreate(upsert)

    expect(upsert).toHaveBeenCalledTimes(2)
  })
})
