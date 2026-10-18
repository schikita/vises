import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

/**
 * POST /proxy6/replace — buy first, then delete replaceIds (DEC-011).
 */
export class ReplaceProxy6Dto {
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

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  replaceIds!: string[];

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
