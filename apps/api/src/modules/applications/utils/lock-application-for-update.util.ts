import type { EntityManager } from 'typeorm';
import { Application } from '../../database/entities/application.entity';
import { throwApplicationNotFound } from './throw-application-not-found.util';

/**
 * `SELECT … FOR UPDATE` on the application row before status + history write.
 */
export const lockApplicationForUpdate = async (
  manager: EntityManager,
  applicationId: string,
): Promise<Application> => {
  const row = await manager
    .createQueryBuilder(Application, 'a')
    .setLock('pessimistic_write')
    .where('a.id = :id', { id: applicationId })
    .getOne();

  if (!row) {
    return throwApplicationNotFound();
  }
  return row;
};
