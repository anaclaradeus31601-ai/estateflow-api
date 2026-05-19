import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentStatus } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  contractId!: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  userId!: string;

  @ApiProperty({ example: 3500 })
  @IsNotEmpty()
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: '2026-05-10' })
  @IsNotEmpty()
  @IsString()
  dueDate!: string;

  @ApiProperty({ example: '2026-05-09' })
  @IsNotEmpty()
  @IsString()
  paidDate!: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  @IsNotEmpty()
  @IsEnum(PaymentStatus)
  status!: PaymentStatus;

  @ApiPropertyOptional({ example: 'pi_xxxxxxxx' })
  @IsOptional()
  @IsString()
  stripePaymentIntentId?: string;

  @ApiPropertyOptional({ example: 'in_xxxxxxxx' })
  @IsOptional()
  @IsString()
  stripeInvoiceId?: string;
}
