import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import {
  PASSWORD_DESCRIPTION,
  StrongPassword,
} from 'src/common/validation/password';

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

  @ApiPropertyOptional({ example: '1995-08-21' })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiPropertyOptional({ example: '350000' })
  @IsOptional()
  @IsString()
  budget?: string;

  @ApiPropertyOptional({ example: 'Florianopolis' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: 'Prefere apartamento perto do centro.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ example: 'Senha@123', description: PASSWORD_DESCRIPTION })
  @IsNotEmpty()
  @IsString()
  @StrongPassword()
  password!: string;
}
