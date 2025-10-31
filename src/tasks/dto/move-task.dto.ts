import { IsOptional, IsNotEmpty,IsUUID, IsString } from "class-validator";
import { AtLeastOneField } from "src/common/decorators/atleast-one-field.decorator";


export class MoveTaskDto {

    @IsOptional()
    @IsUUID()
    targetProjectId?: string | null

  
    @IsOptional()
    @IsUUID()
    @IsString({each: true})
    assignedToIds?:  string[];

    @AtLeastOneField()
    _atLeastOne!: string

}