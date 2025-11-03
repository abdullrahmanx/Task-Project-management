import { AuthService } from "./auth.service"
import { PrismaService } from "src/prisma/prisma.service"
import { JwtService } from "@nestjs/jwt"
import { Test,TestingModule } from "@nestjs/testing"
import { ConfigService } from "@nestjs/config"

jest.mock('bcryptjs', () => ({
    hash: jest.fn().mockResolvedValue('hashed-password'),
    compare: jest.fn().mockResolvedValue(true)
}))
jest.mock('crypto', () => ({
    randomBytes: jest.fn(() => ({
        toString: jest.fn().mockReturnValue('random-bytes')
    })),
    createHash: jest.fn(() => ({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue('fixed-hash')
    }))
}))

jest.mock('../common/utils/email', () => ({
    sendEmail: jest.fn().mockResolvedValue(true)
}))

import { sendEmail } from "../common/utils/email"
import * as bcrypt from 'bcryptjs'

describe('Auth service', () => {
    let service: AuthService
    let prisma: PrismaService

    const mockPrismaService = {
        user: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            findMany: jest.fn(),
            update: jest.fn(),
            delete: jest.fn()
        },
        blacklist: {
            create: jest.fn()
        }
    }
    
    const mockJwtService = {
        sign: jest.fn().mockResolvedValue('token')
    }

    const mockConfigService = {
        get: jest.fn((key: string) => {
            if (key === 'JWT_ACCESS_SECRET') return 'mock-access-secret'
            if (key === 'JWT_REFRESH_SECRET') return 'mock-refresh-secret'
            return null
        })
    }
    
    const userPayLoad = { id: '1', name: 'testname', role: 'USER' }
    
    beforeEach(async () => {
        jest.clearAllMocks()
        
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    AuthService,
                    { provide: PrismaService, useValue: mockPrismaService },
                    { provide: JwtService, useValue: mockJwtService },
                    { provide: ConfigService, useValue: mockConfigService }
                ]
            }).compile()

            
            service = module.get<AuthService>(AuthService)
            prisma = module.get<PrismaService>(PrismaService)
    })


    it('should generate tokens', () => {
        mockJwtService.sign
            .mockReturnValueOnce('mock-access-token')
            .mockReturnValueOnce('mock-refresh-token')

        const result = service['getTokens'](userPayLoad.id, userPayLoad.name, userPayLoad.role);

        expect(mockJwtService.sign).toHaveBeenCalledTimes(2)

        expect(mockJwtService.sign).toHaveBeenNthCalledWith(1, 
            userPayLoad,
            { secret: 'mock-access-secret', expiresIn: '15m' }
        )
        
        expect(mockJwtService.sign).toHaveBeenNthCalledWith(2,
            { id: userPayLoad.id },
            { secret: 'mock-refresh-secret', expiresIn: '7d' }
        )
        
        expect(result).toEqual({
            accessToken: 'mock-access-token',
            refreshToken: 'mock-refresh-token' 
        })
    })

    
    it('POST should register new account', async () => {
       const registerDto= {
        name: 'test',
        email: 'test@example.com',
        password: '123456'
       }


       mockPrismaService.user.create.mockResolvedValue({
                id: '1',
                name: 'test',
                email: 'test@example.com',
                password: '123456',
                role: 'USER',
                createdAt: expect.any(Date),
                verificationToken:'fixed-hash',
                verificationTokenExpires: expect.any(Date),
                isActive: false
       })


       jest.spyOn(service as any, 'getTokens').mockReturnValue({
        accessToken: 'mocked-access',
        refreshToken: 'mocked-refresh',
       })
       
       mockPrismaService.user.update.mockResolvedValue({
        id: '1',
        refreshToken: 'hashed-token'
       })

       const result=  await service.register(registerDto)

       expect(result).toEqual({
            success: true,
            message: 'User created successfully, please verify your email',
            data: {
                accessToken: 'mocked-access',
                refreshToken: 'mocked-refresh',
                user: {
                    id: '1',
                    name: 'test',
                    email: 'test@example.com',
                    role: 'USER',
                    createdAt: expect.any(Date)
                }
            },
       })
       expect(sendEmail).toHaveBeenCalledTimes(1);
       expect(mockPrismaService.user.create).toHaveBeenCalledTimes(1)
       expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
            name: 'test',
            email: 'test@example.com',
            password: 'hashed-password',
            verificationToken:'fixed-hash',
            verificationTokenExpires: expect.any(Date),
            isActive: false
       })})
    })

    it('GET should verify email', async () => {
        const token= 'some-token'
        mockPrismaService.user.findFirst.mockResolvedValue({
            id: '1',
            name: 'test',
            email: 'test@example.com',
            verificationToken: 'fixed-hash',
            verificationTokenExpires:  expect.objectContaining({gt: expect.any(Date)})
        })

        mockPrismaService.user.update.mockResolvedValue({
                id: '1',
                isActive: true,
                verificationToken: null,
                verificationTokenExpires: null
        })

        const result= await service.verifyEmail(token)

        expect(result).toEqual({
            success: true,
            message: 'Email verified successfully'
        })
        expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
            where: {
                verificationToken: 'fixed-hash',
                verificationTokenExpires: expect.objectContaining({gt: expect.any(Date)})
            }
        })
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: {
                id: '1',
            },
            data: {
                isActive: true,
                verificationToken: null,
                verificationTokenExpires: null
            }
        })
    })

    it('POST should login user', async () => {
        const loginDto= {email: 'test@example.com', password: '123456'}

        mockPrismaService.user.findUnique.mockResolvedValue({
            id: '1',
            name: 'test',
            email: 'test@example.com',
            password: 'hashed-password',
            role: 'USER'
        })

        jest.spyOn(service as any, 'getTokens').mockReturnValue({
            accessToken: 'mocked-access',
            refreshToken: 'mocked-refresh',
        });

        (bcrypt.hash as unknown as jest.Mock).mockResolvedValue('mocked-hash-refresh')

        mockPrismaService.user.update.mockResolvedValue({
            id: '1',
            refreshToken: 'mocked-hash-refresh'
        })

        const result= await service.login(loginDto)

        expect(result).toEqual({
            success: true,
            message: 'Login successful',
            accessToken: 'mocked-access',
            refreshToken: 'mocked-refresh',
            data: {
                id: '1',
                name: 'test'
            },
        })
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: {
                email: 'test@example.com'
            }
        })
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where :{
                id: '1'
            },
            data: {
                refreshToken: 'mocked-hash-refresh'
            }
        })

        expect(bcrypt.hash).toHaveBeenCalledTimes(1)
        expect(bcrypt.compare).toHaveBeenCalledTimes(1)
    })


    it('POST should refresh token', async () => {
        const refreshToken= 'some-token'
        const id= '1'

        mockPrismaService.user.findUnique.mockResolvedValue({
            id: '1',
            refreshToken: 'hashed-refresh'
        })

        jest.spyOn(service as any, 'getTokens').mockReturnValue({
            accessToken: 'mock-access',
            refreshToken: 'mock-refresh'
        });

        (bcrypt.hash as unknown as jest.Mock).mockResolvedValue('hashed-refresh')

        mockPrismaService.user.update.mockResolvedValue({
            id: '1',
            refreshToken: 'hashed-refresh'
        })

        const result= await service.refreshToken(refreshToken,id)

        expect(result).toEqual({
            success: true,
            data: {
                accessToken: 'mock-access',
                refreshToken: 'mock-refresh'
            }
        })

        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: {
                id: '1'
            }
        })
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: {
                id: '1'
            },
            data: {
                refreshToken: 'hashed-refresh'
            }
        })
    })

    it('POST should logout user', async () => {
        const id= '1'
        const accessToken= 'some-token'

        mockPrismaService.user.findUnique.mockResolvedValue({
            id
        })

        mockPrismaService.user.update.mockResolvedValue({
            id,
            refreshToken: null,
            refreshTokenExpires: null
        })
        mockPrismaService.blacklist.create.mockResolvedValue({
            token: accessToken
        })

        const result = await service.logout(id,accessToken)

        expect(result).toEqual({
            success: true,
             message: 'Logged out successfully'
        })
        expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
            where: {
                id
            }
        })
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: {
                id
            },
            data: {
                refreshToken: null,
                refreshTokenExpires: null
            }
        })
        expect(mockPrismaService.blacklist.create).toHaveBeenCalledWith({
            data: {
                token: accessToken
            }
        })
    })

    it('POST forgot password', async () => {
        const forgotDto= {email: 'test@example.com'}

        mockPrismaService.user.findFirst.mockResolvedValue({
            email: 'test@example.com',
        })

        mockPrismaService.user.update.mockResolvedValue({
            resetPasswordExpires: expect.any(Date),
            resetPasswordToken: 'fixed-hash'
        })
        const result= await service.forgotPassword(forgotDto)

        expect(result).toEqual({
            success: true,
            message: 'If email exists a reset password link will be sent to your email'
        })

        expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
            where: {
                email: forgotDto.email
            }
        })
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: {
                email: forgotDto.email
            },
            data: {
                resetPasswordExpires: expect.any(Date),
                resetPasswordToken: 'fixed-hash'
            }
        })
    })

    it('POST reset password', async () => {
        const resetDto= {newPassword: '123456'}
        const token= 'some-token'
        mockPrismaService.user.findFirst.mockResolvedValue({
            id: '1',
            resetPasswordToken: 'fixed-hash',
            resetPasswordExpires:  expect.objectContaining({ gt: expect.any(Date) })
        })

        mockPrismaService.user.update.mockResolvedValue({
            password: resetDto.newPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            refreshToken: null,
            refreshTokenExpires: null
        })

        const reset= await service.resetPassword(resetDto,token)

        expect(reset).toEqual({
            success: true,
            message: 'Passowrd reset done, please login with your new password'
        })
        expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
            where: {
                resetPasswordToken: 'fixed-hash',
                resetPasswordExpires: expect.objectContaining({ gt: expect.any(Date)})
            }
        })
        expect(mockPrismaService.user.update).toHaveBeenCalledWith({
            where: {
                id: '1'
            },data: {
                password: 'hashed-refresh',
                resetPasswordToken: null,
                resetPasswordExpires: null,
                refreshToken: null,
                refreshTokenExpires: null
            }
        })
    })

    it('POST change password', async() => {
        const changeDto= {
            currentPassword: '123456',
            newPassword: '1234567'
        }

        mockPrismaService.user.findUnique.mockResolvedValue({
            id: '1',
            password: '123456'
        })

        jest.spyOn(service as any, 'getTokens').mockResolvedValue({
            accessToken: 'mock-access',
            refreshToken: 'mock-refresh'
        });

        (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh')


        mockPrismaService.user.update.mockResolvedValue({
            id: '1',
            password: 'hashed-password',
            refreshToken: 'hashed-refresh'
        })

        const result= await service.changePassword(changeDto,userPayLoad)
        expect(result).toEqual({
            success: true,
            message: 'Password changed successfully, please login with your new password'
        })

    })
})