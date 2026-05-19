import { ApiProperty } from '@nestjs/swagger';
import { ContractStatus, TransactionType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateContractDto {
  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  propertyId!: string;

  @ApiProperty({ example: 'clxxxxxxxxxxxxxxxx' })
  @IsNotEmpty()
  @IsString()
  clientId!: string;

  @ApiProperty({ enum: TransactionType, example: TransactionType.RENT })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  transactionType!: TransactionType;

  @ApiProperty({ enum: ContractStatus, example: ContractStatus.ACTIVE })
  @IsNotEmpty()
  @IsEnum(ContractStatus)
  status!: ContractStatus;

  @ApiProperty({ example: '2026-01-01' })
  @IsNotEmpty()
  @IsString()
  startDate!: string;

  @ApiProperty({ example: '2027-01-01' })
  @IsNotEmpty()
  @IsString()
  endDate!: string;

  @ApiProperty({ example: 3500 })
  @IsNotEmpty()
  @IsNumber()
  rentValue!: number;

  @ApiProperty({ example: 0 })
  @IsNotEmpty()
  @IsNumber()
  saleValue!: number;

  @ApiProperty({ example: 'Contrato de locação residencial...' })
  @IsNotEmpty()
  @IsString()
  terms!: string;

  @ApiProperty({ example: 'https://example.com/contrato.pdf' })
  @IsNotEmpty()
  @IsString()
  documentUrl!: string;
}
