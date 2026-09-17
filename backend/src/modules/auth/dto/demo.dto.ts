import { IsString, MinLength } from 'class-validator';

export class DemoDto {
  @IsString()
  @MinLength(1)
  role!: string;
}
