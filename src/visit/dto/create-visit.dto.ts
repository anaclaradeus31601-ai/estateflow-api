import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { VisitStatus } from '@prisma/client';

export class CreateVisitDto {
    @IsString()
    @IsNotEmpty()  
    propertyId!: string

    @IsString()
    @IsNotEmpty()
    clientId!: string

    @IsString()
    @IsNotEmpty()
    realtorId!: string

    @IsString()
    @IsNotEmpty()
    scheduledAt!: string

    @IsNumber()
    @IsNotEmpty()
    duration!:   number   
    
    @IsString()
    @IsNotEmpty()
    status!:      VisitStatus

    @IsString()
    @IsOptional()
    notes!:       string    
    
    @IsString()
    @IsOptional()
    feedback!:    string
}
