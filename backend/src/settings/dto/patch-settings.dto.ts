import { IsArray, IsInt, IsOptional, IsString } from 'class-validator';

/** FastAPI `SettingsIn` parity — all fields optional. */
export class PatchSettingsDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsInt()
  defaultPrice?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  destinations?: string[];
}
