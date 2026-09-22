import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/** GET /proxy6/price query. */
export class Proxy6PriceQueryDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  count!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  period!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  version?: number;
}
