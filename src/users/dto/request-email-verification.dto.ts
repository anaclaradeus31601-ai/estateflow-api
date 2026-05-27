import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class RequestEmailVerificationDto {
  @ApiProperty({ example: 'joao@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;
}
