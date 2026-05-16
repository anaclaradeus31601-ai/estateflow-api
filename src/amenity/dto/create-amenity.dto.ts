import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAmenityDto {
    @IsNotEmpty()
    @IsString()
    name!:      string

    @IsNotEmpty()
    @IsString()
    icon!:        string

    @IsNotEmpty()
    @IsString()
    category!: string
}
