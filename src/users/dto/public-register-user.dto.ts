import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class PublicRegisterUserDto {
  @ApiProperty({ example: 'João Cliente' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'joao@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '(48) 99999-9999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'senha123', minLength: 6 })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password!: string;
}
