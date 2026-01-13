import {
  IsString,
  IsOptional,
  IsDate,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Name of the author',
    required: true,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty({ message: 'The author name must not be empty.' })
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name: string;

  @ApiProperty({
    description: 'Open Library ID of the author',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  openLibraryId?: string;

  @ApiProperty({
    description: 'Top works of the author',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => (value === '' ? null : value?.trim()))
  topWorks?: string;

  @ApiProperty({
    description: 'Subjects associated with the author',
    required: false,
    maxLength: 1000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => (value === '' ? null : value?.trim()))
  subjects?: string;

  @ApiProperty({
    description: 'Biography of the author',
    required: false,
    maxLength: 5000,
  })
  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @Transform(({ value }) => (value === '' ? null : value))
  bio?: string;

  @ApiProperty({
    description: 'Birth date of the author',
    required: false,
    type: String,
    format: 'date-time',
  })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) =>
    value === '' || value === null ? null : new Date(value),
  )
  birthDate?: Date;

  @ApiProperty({
    description: 'Nationality of the author',
    required: false,
    maxLength: 100,
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value?.trim()))
  nationality?: string;
}
