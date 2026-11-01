import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import {
  PRICE_PER_CLIENT_PATTERN,
  PRICE_PER_CLIENT_PATTERN_MESSAGE,
} from '../constants';

/** Settings patch — all fields optional. `price_per_client` mirrors SettingsDto (FR-3). */
export class PatchSettingsDto {
  @IsOptional()
  @IsString()
  company?: string;

  /** Whole-number decimal string; persisted to `Setting.defaultPrice` / `default_price`. */
  @IsOptional()
  @IsString()
  @Matches(PRICE_PER_CLIENT_PATTERN, {
    message: PRICE_PER_CLIENT_PATTERN_MESSAGE,
  })
  price_per_client?: string;

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
