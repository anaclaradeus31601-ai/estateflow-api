import { IsNotEmpty, IsString }  from "class-validator";

export class CreatePropertyamenityDto {
    @IsNotEmpty()
    @IsString()
    propertyId!: string 

    @IsNotEmpty()
    @IsString()
    amenityId!: string;

    @IsNotEmpty()
    @IsString()
    value!: string;
}
