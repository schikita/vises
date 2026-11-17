import { IsOptional, IsString, MinLength } from 'class-validator';

/** Public self-registration body (FR-2 / §6.1). Role override is rejected in the service. */
export class RegisterDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  login!: string;

  @IsString()
  @MinLength(1)
  password!: string;

  @IsOptional()
  @IsString()
  email?: string;

  /** If supplied and not `agent`, registration is rejected (FR-2 / §6.1). */
  @IsOptional()
  @IsString()
  role?: string;
}
