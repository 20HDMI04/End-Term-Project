import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty({
    description: 'Nickname of the user',
    required: false,
    minLength: 3,
    maxLength: 20,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  nickname?: string;
}
