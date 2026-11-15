import { HttpException, HttpStatus } from '@nestjs/common';
import type {
  ResolveUpsertCreateClientIdInput,
  ResolveUpsertCreateClientIdResult,
} from '../types/resolve-upsert-create-client-id.types';

/**
 * DEC-PF-011 staff apps upsert create: resolve how Application.clientId is set.
 * Never invents an orphan `uid('cli')` without a clients row.
 */
export const resolveUpsertCreateClientId = (
  input: ResolveUpsertCreateClientIdInput,
): ResolveUpsertCreateClientIdResult => {
  const { requestedClientId, clientExists, isStaff } = input;

  if (requestedClientId) {
    if (!clientExists) {
      throw new HttpException('Client not found', HttpStatus.NOT_FOUND);
    }
    return { action: 'use_existing', clientId: requestedClientId };
  }

  if (!isStaff) {
    throw new HttpException(
      'clientId is required',
      HttpStatus.BAD_REQUEST,
    );
  }

  return { action: 'create_new' };
};

export const normalizeOptionalClientId = (
  clientId: string | undefined,
): string | null => {
  const trimmed = (clientId ?? '').trim();
  return trimmed.length > 0 ? trimmed : null;
};
