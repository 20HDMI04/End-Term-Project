import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateSocialDto } from './create-social.dto';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateCommentDto extends PartialType(CreateSocialDto) {
  @ApiProperty({
    description: 'The text content of the comment',
    example: 'This book is amazing! Highly recommended.',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsString()
  @MinLength(1, { message: 'Comment text must be at least 1 character long.' })
  @MaxLength(500, { message: 'Comment text must not exceed 500 characters.' })
  text: string;
}
