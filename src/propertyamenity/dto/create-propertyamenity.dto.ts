import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePropertyamenityDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  propertyId!: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  amenityId!: string;

  @ApiProperty({ example: 'Sim' })
  @IsNotEmpty()
  @IsString()
  value!: string;
}
