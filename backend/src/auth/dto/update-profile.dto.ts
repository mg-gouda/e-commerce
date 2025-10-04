import { IsEmail, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsEmail()
  email: string;
}
