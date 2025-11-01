import { Injectable,NotFoundException,BadRequestException,UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GetProfileResponse, UpdateProfileResponse, UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { UpdateProfileDto} from './dto/updateprofile.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { DeleteResponse } from 'src/common/interfaces/all-interfaces';
import * as bcrypt from 'bcryptjs'
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class UsersService {
    constructor(private readonly prisma: PrismaService,
        private readonly cloudinaryService: CloudinaryService
    ) {}

      async getProfile(user: UserPayLoad): Promise<GetProfileResponse> {
        const userProfile= await this.prisma.user.findUnique({where: {id: user.id},
        select :{
            id: true,
            name: true,
            email: true,
            avatarUrl: true
        }})
        if(!userProfile) throw new NotFoundException('User not found')
        return{
            success: true,
            data: userProfile    
        }    
    }

    async updateProfile(dto: UpdateProfileDto, user: UserPayLoad, file?: Express.Multer.File):
        Promise<UpdateProfileResponse>
        {
            
            const updateUser= await this.prisma.user.findUnique({where: {id: user.id}})
            if(!updateUser) throw new NotFoundException('User not found')
        
            const updatedFields: Record<string, string>= {}    
            if(dto.name) updatedFields.name= dto.name

            if(dto.email) {
                if(!dto.password) throw new BadRequestException('Password is required')
                const checkPass= await bcrypt.compare(dto.password, updateUser.password)
                if(!checkPass) throw new UnauthorizedException('Incorrect password')
                updatedFields.email = dto.email    
            }
            let avatarUrl: string | null = null
            if(file) {
                const uploadResult= await this.cloudinaryService.uploadFile(file,'avatar') as  UploadApiResponse
                if(uploadResult && uploadResult.secure_url) {
                    avatarUrl= uploadResult.secure_url
                    updatedFields.avatarUrl= avatarUrl 
                }
            }
      
            const updatedUser= await this.prisma.user.update({where: {id: updateUser.id},
                data: updatedFields,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatarUrl: true
                }
            })
            return {success: true, message: 'Profile updated successfully',data: updatedUser}
    }
    async deleteUser(dto: DeleteUserDto,user: UserPayLoad): Promise<DeleteResponse> {

        const deleteUser= await this.prisma.user.findUnique({where: {id: user.id}})
        if(!deleteUser) throw new NotFoundException('User not found')

        const checkPass= await bcrypt.compare(dto.password,deleteUser.password)    
        if(!checkPass) throw new UnauthorizedException('Incorrect password')
         
        if(deleteUser.avatarUrl) {
            const url= deleteUser.avatarUrl.split('/')
            const avatarName= url[url.length - 1]
            const avatarPublicId= `avatar/${avatarName.split('.')[0]}`
            await this.cloudinaryService.deleteFile(avatarPublicId)
        }    

        const deletedUser= await this.prisma.user.delete({where: {id: user.id}})

        return { success: true, message: 'User deleted successfully' };    

    }

}
