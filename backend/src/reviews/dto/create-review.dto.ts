import { IsNumber, IsString, IsOptional, Min, Max, MaxLength } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MaxLength(1000)
  comment: string;

  @IsOptional()
  @IsString()
  title?: string;
}