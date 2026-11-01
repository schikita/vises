import { HttpException, HttpStatus } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { User } from '../../database/entities/user.entity';
import { throwNotAgent } from './throw-not-agent.util';

/**
 * `SELECT … FOR UPDATE` on the agent user row (AC-6a / FR-4 / plan § concurrency).
 */
export const lockAgentUserForUpdate = async (
  manager: EntityManager,
  agentId: string,
): Promise<User> => {
  const user = await manager
    .createQueryBuilder(User, 'u')
    .setLock('pessimistic_write')
    .where('u.id = :id', { id: agentId })
    .getOne();

  if (!user) {
    throw new HttpException('User not found', HttpStatus.NOT_FOUND);
  }
  if (user.role !== 'agent') {
    return throwNotAgent();
  }
  return user;
};
