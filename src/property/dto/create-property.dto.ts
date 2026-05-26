import { PropertyStatus, TransactionType, PropertyType } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsNotEmpty,
  IsBoolean,
  IsEnum,
  IsArray,
  IsUrl,
  IsInt,
} from 'class-validator';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Apartamento 3 quartos no centro' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Apartamento amplo com vista para o parque.' })
  @IsString()
  @IsNotEmpty()
  description!: string;

  @ApiProperty({ enum: PropertyType, example: PropertyType.RESIDENTIAL })
  @IsEnum(PropertyType)
  type!: PropertyType;

  @ApiProperty({ enum: TransactionType, example: TransactionType.RENT })
  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @ApiProperty({ enum: PropertyStatus, example: PropertyStatus.AVAILABLE })
  @IsEnum(PropertyStatus)
  status!: PropertyStatus;

  @ApiProperty({ example: 'Av. Paulista' })
  @IsString()
  @IsNotEmpty()
  street!: string;

  @ApiProperty({ example: '1000' })
  @IsString()
  @IsNotEmpty()
  number!: string;

  @ApiPropertyOptional({ example: 'Apto 42' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ example: 'Bela Vista' })
  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state!: string;

  @ApiProperty({ example: '01310-100' })
  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @ApiPropertyOptional({ example: 'Brasil' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiProperty({ example: 85.5 })
  @Type(() => Number)
  @IsNumber()
  area!: number;

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsInt()
  bedrooms!: number;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  bathrooms!: number;

  @ApiPropertyOptional({ example: 1 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  garages?: number;

  @ApiPropertyOptional({ example: 3500 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  rentPrice?: number;

  @ApiPropertyOptional({ example: 450000 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiPropertyOptional({ example: 800 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  condominiumFee?: number;

  @ApiPropertyOptional({ example: 250 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  iptu?: number;

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/img1.jpg'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['https://example.com/video1.mp4'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @ApiPropertyOptional({ example: 'https://example.com/tour' })
  @IsOptional()
  @IsUrl()
  virtualTourUrl?: string;

  @ApiPropertyOptional({ example: -23.5505 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: -46.6333 })
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ example: false })
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @ApiPropertyOptional({ example: 0 })
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  views?: number;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @ApiPropertyOptional({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsOptional()
  @IsString()
  realtorId?: string;
}
