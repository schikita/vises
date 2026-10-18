import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

/** GET /proxy6/countries query. */
export class Proxy6CountriesQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(3)
  version?: number;
}
