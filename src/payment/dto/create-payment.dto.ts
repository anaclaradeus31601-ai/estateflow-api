import { PaymentStatus } from "@prisma/client"
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, isString, IsString } from "class-validator"

export class CreatePaymentDto {
    @IsNotEmpty()
    @IsString()
    contractId!:  string

    @IsNotEmpty()
    @IsString()
    userId!:      string

    @IsNotEmpty()  
    @IsNumber()
    amount!:      number

    @IsNotEmpty()
    @IsString()
    dueDate!:     string

    @IsNotEmpty()
    @IsString()
    paidDate!:    string

    @IsNotEmpty()
    @IsEnum(PaymentStatus)
    status!:      PaymentStatus
    //como eu não vou usar o stripe, vou deixar o stripePaymentIntentId e stripeInvoiceId opicionais
    @IsOptional()
    @IsString()
    stripePaymentIntentId!: string
    @IsOptional()
    @IsString()
    stripeInvoiceId!:       string
}
