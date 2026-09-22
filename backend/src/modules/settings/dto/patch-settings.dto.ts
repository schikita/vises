import {
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';

/** Settings patch — all fields optional. */
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

  @IsOptional()
  @IsBoolean()
  emailOtpEnabled?: boolean;
}
