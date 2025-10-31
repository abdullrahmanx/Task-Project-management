import {  UnauthorizedException,NotFoundException,Injectable, BadRequestException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs'
import * as crypto from 'crypto'
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { sendEmail } from '../common/utils/email';
import { ForgotPassowrdDto } from './dto/forgotpassword.dto';
import { ResetPasswordDto } from './dto/resetpassword.dto';
import { ChangePasswordDto } from './dto/changepassword.dto';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService) {}

    private getTokens(userId: string, name: string, role: string) {
        const accessToken = this.jwtService.sign(
            { id: userId, name, role },
            { secret: this.configService.get('JWT_ACCESS_SECRET'), expiresIn: '15m' }
        );
        const refreshToken= this.jwtService.sign(
            {id: userId},
            {secret: this.configService.get('JWT_REFRESH_SECRET'),expiresIn: '7d'}
        )
        
        return {accessToken, refreshToken}
    }
    async register(dto: RegisterDto) {
        const {email,name,password}= dto

        const hashedPassword= await bcrypt.hash(password,10)
        const verificationToken= crypto.randomBytes(32).toString('hex')
        console.log(verificationToken)
        const hash= crypto.createHash('sha256').update(verificationToken).digest('hex')
        const verificationTokenExpires= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

       
         const newUser= await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                verificationToken: hash,
                verificationTokenExpires,
                isActive: false
            }
        })
        const {accessToken,refreshToken}= this.getTokens(newUser.id,newUser.name,newUser.role)

        await this.prisma.user.update({
            where: { id: newUser.id },
            data: {
               refreshToken: await bcrypt.hash(refreshToken,10)
            }
        })

        

        const url = `${process.env.FRONTEND_URL}/auth/verify-email/${verificationToken}`
        await sendEmail(newUser.email,'verification',{name: newUser.name,url})

        return {
            success: true,
            message: 'User created successfully, please verify your email',
            data: {
                accessToken,
                refreshToken,
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                }
            },
        }
    }
    async verifyEmail(token: string): Promise<{success: boolean,message: string}> {
        const hashedToken= crypto.createHash('sha256').update(token).digest('hex')
        const user= await this.prisma.user.findFirst({where: {verificationToken: hashedToken,
            verificationTokenExpires: {gt: new Date()}
        }})

        if (!user) {
            throw new NotFoundException('User not found');
        }

        const verifiedUser= await this.prisma.user.update({where: {id: user.id},
        data: {
            isActive: true,
            verificationToken: null,
            verificationTokenExpires: null
        }})
        return  {
            success: true,
            message: 'Email verified successfully'
        }
    }
    async login(dto: LoginDto) {
        const {email,password} = dto

        const user= await this.prisma.user.findUnique({where: {email}})
        if(!user) throw new UnauthorizedException('Email or password is incorrect')

        const isPasswordValid= await bcrypt.compare(password,user.password)
        if (!isPasswordValid) throw new UnauthorizedException('Email or password is incorrect');

        // if(!user.isActive) {
        //   throw new  UnauthorizedException('Email verification is required');
        // }
        const {accessToken,refreshToken} = this.getTokens(user.id,user.name,user.role)
        await this.prisma.user.update({
                where: { id: user.id },
                data: {
                    refreshToken: await bcrypt.hash(refreshToken,10),
                },
        });
        return {
            success: true,
            message: 'Login successful',
            accessToken,
            refreshToken,
            data: {
                id: user.id,
                name: user.name
            },
        }

    }
    async refreshToken(refreshToken: string,id: string) {  
        const user= await this.prisma.user.findUnique({
            where: {
                id
            }
        })
        if(!user || !user.refreshToken) {
            throw new UnauthorizedException('Access Denied');
        }

        const isValid= await bcrypt.compare(refreshToken,user.refreshToken)
        if(!isValid) {
            throw new UnauthorizedException('Invalid or expired token')
        }

        const {accessToken,refreshToken: newRefreshToken}= this.getTokens(user.id,user.name,user.role)

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data :{
                refreshToken: await bcrypt.hash(newRefreshToken,10)
            }
        })
        return {
            success: true,
            data: {
                accessToken,
                refreshToken
            }
        }
    }
    async logout(id : string,accessToken: string): Promise<{success: boolean,message: string}> {
        
        const user= await this.prisma.user.findUnique({where: {id}})
        if(!user) {
            throw new NotFoundException('User not found')
        }

        await this.prisma.user.update({
            where: {
                id
            },
            data: {
                refreshToken: null,
                refreshTokenExpires: null
            }
        })
        await this.prisma.blacklist.create({data: {token: accessToken}})
        
        return { success: true, message: 'Logged out successfully' };
    }
    async forgotPassword(dto: ForgotPassowrdDto): Promise<{success: boolean,message: string}> {
        
        const user= await this.prisma.user.findFirst({where: {email: dto.email}})
      
        if (!user) {
            return {success: true,message: 'If email exists a reset password link will be sent to your email'}
        }
        
        const token= crypto.randomBytes(32).toString('hex')
        const hashedToken= crypto.createHash('sha256').update(token).digest('hex')
        const resetPasswordExpires= new Date(Date.now() + 15 * 60 * 1000) 
        const url = `${process.env.FRONTEND_URL}/auth/reset-password/${token}`
        await sendEmail(user.email,'password',{name: user.name,url})
        console.log(token)
        const updateUser= await this.prisma.user.update({where: {email: dto.email},
        data: {
            resetPasswordExpires,
            resetPasswordToken: hashedToken
        }})
        return {
            success: true,
            message: 'If email exists a reset password link will be sent to your email'
        }
    }
    async resetPassword(dto: ResetPasswordDto,token: string): Promise<{success: boolean,message: string}> {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex')

        const user= await this.prisma.user.findFirst({where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {gt: new Date()}
        }})
        if(!user) throw new NotFoundException('User not found')
        
        const newPassHashed= await bcrypt.hash(dto.newPassword,10)
        
        const updatedUser= await this.prisma.user.update({where: {id: user.id},
        data: {
            password: newPassHashed,
            resetPasswordToken: null,
            resetPasswordExpires: null,
            refreshToken: null,
            refreshTokenExpires: null
        }})
        return {
            success: true,
            message: 'Passowrd reset done, please login with your new password'
        }
    }
    async changePassword(dto: ChangePasswordDto,user: UserPayLoad): Promise<{success: boolean,message: string}> {
        const existingUser= await this.prisma.user.findUnique({where: {id: user.id}})
        if(!existingUser) throw new NotFoundException('User not found')
        const currentPassHash= await bcrypt.compare(dto.currentPassword,existingUser.password)    
        if(!currentPassHash) throw new BadRequestException('Current password is incorrect')
    
        const newPassHash= await bcrypt.hash(dto.newPassword,10) 
        const tokens= this.getTokens(user.id,user.name,user.role)
        const updatedUser= await this.prisma.user.update({where: {id: user.id},
        data: {
            password: newPassHash,
            refreshToken: await bcrypt.hash(tokens.refreshToken,10)
        }})   

        return {success: true, message: 'Password changed successfully, please login with your new password'}
    }
  
}
