import { IsNotEmpty, IsString } from 'class-validator';

/** Body for `POST /api/apps/:applicationId/portal-autofill` (DEC-001). */
export class PortalAutofillDto {
  @IsString()
  @IsNotEmpty()
  applicantId!: string;
}
