import { IsEmail,IsString, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOwnerDto {
    @IsString()
    id!: string  

    @IsNotEmpty()
    @IsString()
    name!: string

    @IsNotEmpty()
    @IsEmail()
    email!: string

    @IsNotEmpty()
    phone!: string

    @IsNotEmpty()
    cpfCnpj!: string  

    @IsNotEmpty()
    @IsString()
    address!: string

}
