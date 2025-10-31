import { TaskPriority, TaskStatus } from "@prisma/client";
import { IsNotEmpty,IsOptional,MinLength,MaxLength,IsString, IsEnum, IsDateString, IsUUID } from "class-validator";
import { AtLeastOneField } from "src/common/decorators/atleast-one-field.decorator";
export class AdminUpdateTaskDto {

    @IsOptional()
    @MinLength(3)
    @IsString()
    @IsNotEmpty()
    @MaxLength(30)
    title?: string

    @IsOptional()
    @IsString()
    @IsNotEmpty()
    @MinLength(10)
    @MaxLength(120)
    description?: string

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(TaskStatus)
    status?: TaskStatus

    @IsOptional()
    @IsNotEmpty()
    @IsEnum(TaskPriority)
    priority?: TaskPriority

    @IsOptional()
    @IsNotEmpty()
    @IsDateString()
    dueDate?: string


    @IsOptional()
    @IsNotEmpty()
    @IsUUID('4', {each: true})
    assignedToIds?: string[]

    @AtLeastOneField()
    _atLeastOne!: string

}