import type {
  ApplicationDto,
  ApplicationStatusHistoryResponseDto,
} from '@vises/contracts';
import type { ApplicationStatusChangeDto } from '../dto/application-status-change.dto';
import type { StaffTransitionActor } from '../types';

export interface IApplicationsService {
  changeStatus(
    applicationId: string,
    body: ApplicationStatusChangeDto,
    actor: StaffTransitionActor,
  ): Promise<ApplicationDto>;

  /** Monitor-only drafting → pending (AC-13). */
  markPendingByMonitor(applicationId: string): Promise<ApplicationDto>;

  /** Status history oldest → newest (T14.2 / FR-7 / §6.6). */
  getHistory(
    applicationId: string,
    actor: StaffTransitionActor,
  ): Promise<ApplicationStatusHistoryResponseDto>;
}
