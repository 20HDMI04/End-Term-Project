import { PartialType } from '@nestjs/mapped-types';
import { CreateBookDto } from './create-book.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateBookDto extends PartialType(CreateBookDto) {
  @ApiProperty({
    description: 'Approval status of the book',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  approveStatus?: boolean;
}
