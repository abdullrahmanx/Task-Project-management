import { IsNotEmpty,IsOptional,IsArray,IsString,IsEnum,MinLength,MaxLength, Max, IsDateString, IsUUID } from "class-validator";
import { TaskStatus,TaskPriority } from '@prisma/client';

export class CreateTaskDto {
    @MinLength(3)
    @MaxLength(30)
    @IsNotEmpty()
    title: string

    @IsOptional()
    @MinLength(10)
    @MaxLength(120)
    description: string

    @IsOptional()
    @IsEnum(TaskStatus)
    status?: TaskStatus

    @IsOptional()
    @IsEnum(TaskPriority)
    priority?: TaskPriority


    @IsNotEmpty()
    @IsDateString()
    dueDate: string
    
    @IsOptional()
    @IsUUID()
    projectId?: string


    @IsOptional()
    @IsArray()
    @IsUUID('4',{each: true})
    userIds?: string[]
}