import { IsString, MinLength } from 'class-validator';

/**
 * Body for `PUT /api/apps/:applicationId/bls-http-workflow/portal-credentials`.
 * Staff records the portal login password for an application whose portal
 * account exists but was registered outside this engine (no vaulted secret).
 */
export class SetBlsHttpWorkflowPortalCredentialsDto {
  @IsString()
  @MinLength(8)
  portalPassword!: string;
}
