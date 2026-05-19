import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateOwnerDto {
  @ApiProperty({ example: 'Carlos Proprietário' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'carlos@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+5511999999999' })
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ example: '123.456.789-00' })
  @IsNotEmpty()
  cpfCnpj!: string;

  @ApiProperty({ example: 'Rua das Flores, 100 - São Paulo, SP' })
  @IsNotEmpty()
  @IsString()
  address!: string;
}
