import { IsOptional,IsString,IsNotEmpty, MinLength, MaxLength, IsUUID, IsArray} from "class-validator";
import { AtLeastOneField } from "src/common/decorators/atleast-one-field.decorator";


export class UpdateProjectDto {

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(40)
    name?: string

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(100)
    description?: string

    @IsOptional()
    @IsUUID('4', {each: true})
    @IsArray()
    membersIds?: string[]

    @AtLeastOneField()
    _atLeastOne!: string

}
