import { IsString, IsOptional, MaxLength, IsIn } from 'class-validator';

export class UpdateSettingDto {
  @IsString()
  @MaxLength(5000)
  value: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsString()
  @IsIn(['string', 'number', 'boolean', 'json'])
  type?: string;
}
