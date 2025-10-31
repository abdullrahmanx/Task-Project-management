import { IsEmail,IsOptional,MinLength,MaxLength,IsNotEmpty } from "class-validator";
import { AtLeastOneField } from "src/common/decorators/atleast-one-field.decorator";

export class UpdateProfileDto {

    @IsOptional()
    @IsEmail()
    email: string 

    @IsOptional()
    @MinLength(3)
    @MaxLength(10)
    @MaxLength(10)
    name: string

    @IsOptional()
    @IsNotEmpty()
    password: string

    @AtLeastOneField()
    _atLeastOne!: string

}