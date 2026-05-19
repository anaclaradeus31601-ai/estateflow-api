import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAmenityDto {
  @ApiProperty({ example: 'Piscina' })
  @IsNotEmpty()
  @IsString()
  name!: string;

  @ApiProperty({ example: 'pool' })
  @IsNotEmpty()
  @IsString()
  icon!: string;

  @ApiProperty({ example: 'lazer' })
  @IsNotEmpty()
  @IsString()
  category!: string;
}
