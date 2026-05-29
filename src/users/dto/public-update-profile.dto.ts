import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { PASSWORD_DESCRIPTION, StrongPassword } from 'src/common/validation/password';

export class PublicUpdateProfileDto {
  @ApiPropertyOptional({ example: 'João Cliente' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'joao@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: '(48) 99999-9999' })
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

  @ApiPropertyOptional({
    example: 'Senha@123',
    description: PASSWORD_DESCRIPTION,
  })
  @IsOptional()
  @IsString()
  @StrongPassword()
  password?: string;
}
