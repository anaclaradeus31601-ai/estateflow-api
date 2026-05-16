import{ IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto { 
    // !-> definitive assignment assertion operator, tells TypeScript that these properties will be assigned values, even if they are not initialized in the constructor.
    
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsEmail()
    @IsNotEmpty()
    email!: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(6)
    password!: string;
   
}