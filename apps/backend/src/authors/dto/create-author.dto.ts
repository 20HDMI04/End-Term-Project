import {
  IsString,
  IsOptional,
  IsDate,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class CreateAuthorDto {
  @IsString()
  @IsNotEmpty({ message: 'The author name must not be empty.' })
  @MaxLength(255)
  @Transform(({ value }) => value?.trim())
  name: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => (value === '' ? null : value))
  openLibraryId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => (value === '' ? null : value?.trim()))
  topWorks?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  @Transform(({ value }) => (value === '' ? null : value?.trim()))
  subjects?: string;

  @IsString()
  @IsOptional()
  @MaxLength(5000)
  @Transform(({ value }) => (value === '' ? null : value))
  bio?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  @Transform(({ value }) =>
    value === '' || value === null ? null : new Date(value),
  )
  birthDate?: Date;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  @Transform(({ value }) => (value === '' ? null : value?.trim()))
  nationality?: string;
}
