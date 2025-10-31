import { Injectable,NotFoundException,BadRequestException,UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { UpdateProfileDto} from './dto/updateprofile.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { DeleteResponse } from 'src/common/interfaces/all-interfaces';
import * as bcrypt from 'bcryptjs'

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService) {}

      async getProfile(user: UserPayLoad):Promise<{success: boolean,data: {id: string, name: string, email: string}}> {
        const userProfile= await this.prisma.user.findUnique({where: {id: user.id},
        select :{
            id: true,
            name: true,
            email: true
        }})
        if(!userProfile) throw new NotFoundException('User not found')
        return{
            success: true,
            data: userProfile    
        }    
    }
    async updateProfile(dto: UpdateProfileDto, user: UserPayLoad): 
    Promise<{success: boolean,message: string, data: {id: string, name: string, email: string}}> {
            
            const updateUser= await this.prisma.user.findUnique({where: {id: user.id}})
            if(!updateUser) throw new NotFoundException('User not found')
        
            const updatedFields: {[key: string]: string}= {}    
            if(dto.name) updatedFields.name= dto.name

            if(dto.email) {
                if(!dto.password) throw new BadRequestException('Password is required')
                const checkPass= await bcrypt.compare(dto.password, updateUser.password)
                if(!checkPass) throw new UnauthorizedException('Incorrect password')
                updatedFields.email = dto.email    
            }
            const updatedUser= await this.prisma.user.update({where: {id: updateUser.id},
                data: updatedFields,
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            })
            return {success: true, message: 'Profile updated successfully',data: updatedUser}
    }
    async deleteUser(dto: DeleteUserDto,user: UserPayLoad): Promise<DeleteResponse> {

        const deleteUser= await this.prisma.user.findUnique({where: {id: user.id}})
        if(!deleteUser) throw new NotFoundException('User not found')

        const checkPass= await bcrypt.compare(dto.password,deleteUser.password)    
        if(!checkPass) throw new UnauthorizedException('Incorrect password')
       
        const deletedUser= await this.prisma.user.delete({where: {id: user.id}})

        return { success: true, message: 'User deleted successfully' };    

    }


}
