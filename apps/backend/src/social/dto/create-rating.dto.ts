import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Max,
  Min,
} from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({
    description: 'The rating score for the book, between 1 and 5',
    example: 4,
  })
  @IsDefined()
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  @Min(1)
  @Max(5)
  score: number;
}
