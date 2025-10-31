import { IsOptional,IsNumber,IsString, IsEnum } from "class-validator";
import { Type ,Transform} from "class-transformer";
import { Role, TaskPriority, TaskStatus } from "@prisma/client";
export class PaginateDto {

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    page?: number

    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    limit?: number

    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsString()
    sortBy?: string;

    @IsOptional()
    @IsString()
    sortOrder?: 'asc' | 'desc';

    @IsOptional()
    filters?: Record<string, any>
}

export class TaskQueryDto extends PaginateDto {
  @IsOptional()
  @Transform(({value}) => value.toUpperCase())
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @IsOptional()
  @Transform(({value}) => value.toUpperCase())
  @IsEnum(TaskPriority)
  priority?: TaskPriority;
}
export class AdminDto extends PaginateDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role
}


 
interface FindManyOptions {
  searchFields?: string[]
  allowedSortFields?: string[]
  relationField?: string; 
  relationType?: 'one' | 'many'
}


export function buildFindManyQuery(paginationParams: PaginateDto & {user?: string},options: FindManyOptions= {}) {
    const page = Math.max(1, Number(paginationParams.page ?? 1));
    const limit = Math.max(1, Number(paginationParams.limit ?? 10));
    const skip = (page - 1) * limit;
    const { searchFields = [],
            allowedSortFields = ['createdAt'],
            relationField,
            relationType = 'one' } = options;

    const where: Record<string, any> = {};

    
    if (paginationParams.search && searchFields.length > 0) {
      where.OR= searchFields.map((field) => ({
        [field]: {contains: paginationParams.search,mode: 'insensitive'}
      }))
    }
    
    if(relationField && paginationParams.user) {
     where[relationField] = relationType === 'many' ?
      {some: {id: paginationParams.user}}: {id: paginationParams.user}
    }
  
    if (paginationParams.filters) {
      const filters= typeof paginationParams=== 'string' ?
      JSON.parse(paginationParams)
      : paginationParams.filters
      Object.assign(where, paginationParams.filters)
    }

   

    const sortBy= allowedSortFields.includes(paginationParams.sortBy ?? '') ? paginationParams.sortBy! : 'createdAt'
    const order= paginationParams.sortOrder ?? 'desc'

    return {
      query: {
        where,
        take: limit,
        skip,
        orderBy: { [sortBy]: order },
      },
      paginate: { page, limit },
    };
  }



