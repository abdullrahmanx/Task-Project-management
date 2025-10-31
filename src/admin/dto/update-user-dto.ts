import { IsEnum, IsNotEmpty } from 'class-validator'
import { Role} from '@prisma/client'
import { Transform } from 'class-transformer'

export class UpdateUserRoleDto {
  @IsNotEmpty()
  @Transform(({value}) => value.toUpperCase())
  @IsEnum(Role, { message: 'Role must be either ADMIN or USER' })
  role: Role
}