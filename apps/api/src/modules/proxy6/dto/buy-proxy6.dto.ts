import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/** POST /proxy6/buy — period/country required (REQ-015 / CON-009). */
export class BuyProxy6Dto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  count!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  period!: number;

  @IsString()
  @MinLength(2)
  @MaxLength(8)
  country!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  version?: number;

  @IsOptional()
  @IsString()
  @MaxLength(16)
  type?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  descr?: string;
}
