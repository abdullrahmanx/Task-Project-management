import { Body, Post,Get,Put, Delete,Controller, HttpCode, HttpStatus, Param,UseGuards,Headers, BadRequestException} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { ForgotPassowrdDto } from './dto/forgotpassword.dto';
import { ResetPasswordDto } from './dto/resetpassword.dto';
import { ChangePasswordDto } from './dto/changepassword.dto';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { Throttle } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService) {}

    @Throttle({default: {limit: 2, ttl: 60000}})
    @Post('register')
    @HttpCode(HttpStatus.CREATED) 
    async register (@Body() dto: RegisterDto) {
        return this.authService.register(dto)
    }


    @Get('verify-email/:token')
    async verifyEmail(@Param('token') token: string) {
        return this.authService.verifyEmail(token)
    }

    @Throttle({default: {limit: 5, ttl: 60000}})
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto)
    } 

    @Post('/refresh-token')
    async refreshToken(@Body('refreshToken') refreshToken: string) {
        if(!refreshToken) {
            throw new BadRequestException('Refresh token is required')
        }
        let payload= this.jwtService.verify(refreshToken,{
            secret: this.configService.get('JWT_REFRESH_SECRET')
        })
        
        return this.authService.refreshToken(refreshToken,payload.id)

    }
    
    @UseGuards(JwtAuthGuard)
    @Post('logout')
    async logout(@Headers('authorization') authHeader: string, @CurrentUser() user: UserPayLoad) { 
        if (!authHeader) throw new BadRequestException('Authorization header is required');
        return this.authService.logout(user.id,authHeader.split(' ')[1])
    }

    @Throttle({default: {limit: 2, ttl: 60000}})
    @Post('forgot-password')
    async forgotPassword(@Body() dto: ForgotPassowrdDto) {
        return this.authService.forgotPassword(dto)
    }
    
    @Throttle({default: {limit: 2, ttl: 60000}})
    @Post('reset-password/:token')
    async resetPassword(@Body() dto: ResetPasswordDto, @Param('token') token: string) {
        return this.authService.resetPassword(dto,token)
    }   

    @Throttle({default: {limit: 2, ttl: 60000}})
    @UseGuards(JwtAuthGuard)
    @Put('change-password')
    async changePassword(@Body() dto: ChangePasswordDto,@CurrentUser() user: UserPayLoad) {
        return this.authService.changePassword(dto,user)
    }
    
}
