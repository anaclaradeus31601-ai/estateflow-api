import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import {
  PASSWORD_DESCRIPTION,
  StrongPassword,
} from 'src/common/validation/password';

export class ConfirmPasswordResetDto {
  @ApiProperty({ example: 'token-de-recuperacao' })
  @IsNotEmpty()
  @IsString()
  token!: string;

  @ApiProperty({ example: 'Senha@123', description: PASSWORD_DESCRIPTION })
  @IsNotEmpty()
  @IsString()
  @StrongPassword()
  newPassword!: string;
}
