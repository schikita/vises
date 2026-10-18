import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
} from 'class-validator';

/** POST /proxy6/prolong — period + ids required (REQ-015). */
export class ProlongProxy6Dto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  period!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[];
}
