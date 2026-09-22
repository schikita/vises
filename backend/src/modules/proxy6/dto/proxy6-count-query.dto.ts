import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator';

/** GET /proxy6/count query. */
export class Proxy6CountQueryDto {
  @IsString()
  @MinLength(2)
  @MaxLength(8)
  country!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  version?: number;
}
