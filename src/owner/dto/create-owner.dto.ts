import { IsEmail,IsString, IsNotEmpty } from 'class-validator';

export class CreateOwnerDto { 

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
