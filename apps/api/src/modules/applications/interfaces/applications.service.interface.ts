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

  /** Monitor-only draft|filling → not_ready_for_appointment (FR-13). */
  markPendingByMonitor(applicationId: string): Promise<ApplicationDto>;

  /** Status history oldest → newest (T14.2 / FR-13 / §6.6). */
  getHistory(
    applicationId: string,
    actor: StaffTransitionActor,
  ): Promise<ApplicationStatusHistoryResponseDto>;
}
