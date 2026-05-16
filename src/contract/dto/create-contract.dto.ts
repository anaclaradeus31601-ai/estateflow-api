import { ContractStatus, TransactionType } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator'
export class CreateContractDto {
    @IsNotEmpty()
    @IsString()
    propertyId!: string

    @IsNotEmpty()
    @IsString()
    clientId!: string

    @IsNotEmpty()
    @IsEnum(TransactionType)
    transactionType!: TransactionType

    @IsNotEmpty()
    @IsEnum(ContractStatus)
    status!: ContractStatus  

    @IsNotEmpty()
    @IsString()
    startDate!: string

    @IsNotEmpty()
    @IsString()
    endDate!: string

    @IsNotEmpty()
    @IsNumber()
    rentValue!: number

    @IsNotEmpty()
    @IsNumber()
    saleValue!: number

    @IsNotEmpty()
    @IsString()
    terms!: string

    @IsNotEmpty()
    @IsString()
    documentUrl!: string
}
