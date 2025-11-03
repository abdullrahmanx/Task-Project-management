import { Test,TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { PrismaService } from "src/prisma/prisma.service";
import { NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcryptjs'
import { after } from "node:test";



jest.mock('bcryptjs', () => ({
    compare: jest.fn().mockResolvedValue(true),
    hash: jest.fn().mockResolvedValue('hashed-password'),
}));


describe('UserService', () => {
     
    let service: UsersService


    const mockPrismaService= {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        }
    }
    
    
    const mockCloudinaryService= {
        uploadFile: jest.fn().mockResolvedValue({
            secure_url: 'https://mocked-cloudinary-url.com/avatar.png',
            public_id: 'fortest'
        }),
        deleteFile: jest.fn().mockResolvedValue({result: 'ok'})
    }
    
   

    beforeEach(async () => {
        const module: TestingModule= await Test.createTestingModule({
            providers: [UsersService,{
                provide: PrismaService,
                useValue: mockPrismaService
            },{
                provide: CloudinaryService,
                useValue: mockCloudinaryService
            }]
        }).compile()

        service=  module.get<UsersService>(UsersService)

        jest.clearAllMocks();

    })
    

    const userPayLoad= {id: '1',name: 'testname',role: 'USER'}
    const mockUser= {id: '1',name: 'testname',email: 'test@example.com',avatarUrl: 'testurl'}
    
    it("GET user profile", async () => {
        
        mockPrismaService.user.findUnique.mockResolvedValue(mockUser)

        const result = await service.getProfile(userPayLoad)
        
        expect(result).toEqual({
            success: true,
            data: mockUser
        })
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: {id: userPayLoad.id},
            select: expect.any(Object)
        })
    })    

    it('should return not found', async () => {
        mockPrismaService.user.findUnique.mockResolvedValue(null)
        await expect(service.getProfile(userPayLoad)).rejects.toThrow(NotFoundException)
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: { id: userPayLoad.id },
            select: expect.any(Object),
        });
    })
   
    it('UPDATE user profile with file upload', async () => {
        const updatedDto= {name: 'new name',email: 'test@example.com',password: 'checkpass',_atLeastOne: 'anything'}
        const file= {
            buffer: Buffer.from('file'),
            originalname: 'avatar.png'
        } as Express.Multer.File


        const existingUser= {
            id: '1',
            name: 'oldname',
            email: 'oldemail',
            password: 'hashedpass'
        }

        mockPrismaService.user.findUnique.mockResolvedValue(existingUser);


        

        const updateUser= {
            id: '1',
            name: 'new name',
            email: 'test@example.com',
            avatarUrl: 'avatar.com'
        }

        mockPrismaService.user.update.mockResolvedValue(updateUser)

        const result= await service.updateProfile(updatedDto,userPayLoad,file)


        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({where: {id: userPayLoad.id}})
        expect(result).toEqual({
            success: true,
             message: 'Profile updated successfully',
             data: updateUser
        })
        
        expect(mockCloudinaryService.uploadFile).toHaveBeenCalledWith(file,'avatar')
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: {id: userPayLoad.id},
            data: {
                name: 'new name',
                email: 'test@example.com',
                avatarUrl: 'https://mocked-cloudinary-url.com/avatar.png'
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
            }
        })

    })

    it('UPDATE profile without avatar', async () => {
        const updatedDto= {name: 'new name',
            email: 'test@example.com',
            password: 'checkpass',
            _atLeastOne: 'anything'
        }
        
        const existingUser= {
            id: '1',
            name: 'oldname',
            email: 'oldemail',
            password: 'hashedpass'
        }

        mockPrismaService.user.findUnique.mockResolvedValue(existingUser);


         const updateUser= {
            id: '1',
            name: 'newname',
            email: 'test@example.com',
        }

        mockPrismaService.user.update.mockResolvedValue(updateUser)

        const result= await service.updateProfile(updatedDto,userPayLoad)

        expect(result).toEqual({
            success: true,
            message: 'Profile updated successfully',
            data: updateUser
        })

        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: {id: userPayLoad.id},
            data: {
                name: 'new name',
                email: 'test@example.com',
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true
            }
        })
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: {id: userPayLoad.id}
        })
    })

    it('UPDATE should get not found', async () => {
        const updatedDto= {
            name: 'new name',
            email: 'test@example.com',
            password: 'checkpass',
            _atLeastOne: 'anything'
        }

        mockPrismaService.user.findUnique.mockResolvedValue(null)
        
        await expect(service.updateProfile(updatedDto,userPayLoad)).rejects.toThrow(NotFoundException)
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: {id: userPayLoad.id}
        })
    })

    const deleteDto= {password: 'checkpass'}

    it('DELETE user', async () => {
        
        const user= {
            id: '1',
            avatarUrl: 'avatar/avatar'
        }
        mockPrismaService.user.findUnique.mockResolvedValue(user);


        mockPrismaService.user.delete.mockResolvedValue(user)
        const result= await service.deleteUser(deleteDto,userPayLoad)

        expect(result).toEqual({
            success: true,
            message: 'User deleted successfully'
        })
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: {id: userPayLoad.id}
        })
        expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
            where: {id: userPayLoad.id,
                
            }
        })
        expect(mockCloudinaryService.deleteFile).toHaveBeenCalledWith('avatar/avatar')
    })

    it('Delete should get not found', async() => {
        mockPrismaService.user.findUnique.mockResolvedValue(null)
        await expect(service.deleteUser(deleteDto,userPayLoad)).rejects.toThrow(NotFoundException)
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where:{id: userPayLoad.id}
        })
    })

})