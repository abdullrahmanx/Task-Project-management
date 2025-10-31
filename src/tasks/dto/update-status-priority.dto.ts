import { TaskPriority, TaskStatus } from "@prisma/client";
import { Transform } from "class-transformer";
import { IsEnum,IsOptional } from "class-validator";
import { AtLeastOneField } from "src/common/decorators/atleast-one-field.decorator";

export class UpdateStatusPriorityDto {
    @IsOptional()
    @Transform(({value}) => value.toUpperCase())
    @IsEnum(TaskStatus)
    status?: TaskStatus

    @IsOptional()
    @Transform(({value}) => value.toUpperCase())
    @IsEnum(TaskPriority)
    priority?: TaskPriority

    @AtLeastOneField()
    _atLeastOne!: string

}