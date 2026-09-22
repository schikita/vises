import { ArrayMinSize, IsArray, IsString } from 'class-validator';

/** POST /proxy6/delete */
export class DeleteProxy6Dto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  ids!: string[];
}
