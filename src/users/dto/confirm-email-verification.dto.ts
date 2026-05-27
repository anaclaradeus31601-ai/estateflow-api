import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ConfirmEmailVerificationDto {
  @ApiProperty({ example: 'token-de-verificacao' })
  @IsNotEmpty()
  @IsString()
  token!: string;
}
