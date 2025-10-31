import { IsOptional, IsNotEmpty, IsString,MinLength, MaxLength, IsUUID, IsNumber} from "class-validator";


export class CreateProjectDto {

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(40)
    name: string

    @IsOptional()
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(100)
    description?: string

  

    @IsOptional()
    @IsNotEmpty()
    @IsUUID()
    membersIds?: string[]

    
    @IsOptional()
    @IsNotEmpty()
    @IsUUID()
    tasksIds?: string[]

}

