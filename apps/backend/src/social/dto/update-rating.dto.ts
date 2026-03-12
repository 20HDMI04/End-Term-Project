import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateRatingDto } from './create-rating.dto';
import {
  IsDefined,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  Max,
} from 'class-validator';

export class UpdateRatingDto extends PartialType(CreateRatingDto) {
  @ApiProperty({
    description: 'The new score for the rating, between 1 and 5',
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
