import { IsOptional, IsString } from 'class-validator';

/**
 * Query for `GET /clients` (qa-polish DEC-P3 / DEC-P16).
 * Values are normalized via `parseClientsListQuery` (page/pageSize clamps;
 * unknown `sortBy` falls back to `createdAt`; `sortDir` defaults to `desc`).
 */
export class ClientsListQueryDto {
  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  pageSize?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsString()
  sortDir?: string;
}
