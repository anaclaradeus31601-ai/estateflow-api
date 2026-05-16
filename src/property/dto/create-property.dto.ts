import {
  PropertyStatus,
  TransactionType,
  PropertyType,
} from '@prisma/client';

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
  // Informações principais
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

  @IsEnum(PropertyType)
  type!: PropertyType;

  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @IsEnum(PropertyStatus)
  status!: PropertyStatus;

  // Endereço
  @IsString()
  @IsNotEmpty()
  street!: string;

  @IsString()
  @IsNotEmpty()
  number!: string;

  @IsOptional()
  @IsString()
  complement?: string;

  @IsString()
  @IsNotEmpty()
  neighborhood!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  state!: string;

  @IsString()
  @IsNotEmpty()
  zipCode!: string;

  @IsOptional()
  @IsString()
  country?: string;

  // Detalhes do imóvel
  @Type(() => Number)
  @IsNumber()
  area!: number;

  @Type(() => Number)
  @IsInt()
  bedrooms!: number;

  @Type(() => Number)
  @IsInt()
  bathrooms!: number;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  garages?: number;

  // Valores
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  rentPrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  condominiumFee?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  iptu?: number;

  // Mídia
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  videos?: string[];

  @IsOptional()
  @IsUrl()
  virtualTourUrl?: string;

  // Localização
  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  longitude?: number;

  // Metadados
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @Type(() => Number)
  @IsOptional()
  @IsInt()
  views?: number;

  // Relações
  @IsString()
  @IsNotEmpty()
  ownerId!: string;

  @IsOptional()
  @IsString()
  realtorId?: string;
}