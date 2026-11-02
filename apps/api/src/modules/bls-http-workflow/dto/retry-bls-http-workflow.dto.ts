import { IsOptional, IsString } from 'class-validator';

/** Body for `POST …/bls-workflow/:workflowId/retry` (TASK-014). */
export class RetryBlsHttpWorkflowDto {
  /** Optional task id; default = current failed / waiting task. */
  @IsOptional()
  @IsString()
  taskId?: string;
}
