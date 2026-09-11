import { IsOptional, IsString } from 'class-validator';

/** FastAPI `UserIn` parity (empty name → service «Укажите имя»). */
export class CreateUserDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  login?: string;

  @IsOptional()
  @IsString()
  role?: string;
}
