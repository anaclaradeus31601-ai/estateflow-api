import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum } from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class CreateVisitDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  propertyId!: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  clientId!: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsString()
  @IsNotEmpty()
  realtorId!: string;

  @ApiProperty({ example: '2026-05-20T14:00:00.000Z' })
  @IsString()
  @IsNotEmpty()
  scheduledAt!: string;

  @ApiProperty({ example: 60, description: 'Duração em minutos' })
  @IsNumber()
  @IsNotEmpty()
  duration!: number;

  @ApiProperty({ enum: VisitStatus, example: VisitStatus.SCHEDULED })
  @IsEnum(VisitStatus)
  @IsNotEmpty()
  status!: VisitStatus;

  @ApiPropertyOptional({ example: 'Cliente prefere visita pela manhã' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ example: 'Gostou do imóvel' })
  @IsString()
  @IsOptional()
  feedback?: string;
}
