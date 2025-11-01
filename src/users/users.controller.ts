import { Controller,Body,UseGuards,Get,Put,Delete, UseInterceptors, UploadedFile, } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { UpdateProfileDto } from './dto/updateprofile.dto';
import { DeleteUserDto } from './dto/delete-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
    constructor(private readonly userService: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getProfile(@CurrentUser() user: UserPayLoad) {
        return this.userService.getProfile(user)
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    @Put('me')
    async updateProfile (@Body() dto: UpdateProfileDto,
    @CurrentUser() user: UserPayLoad,
    @UploadedFile() file?: Express.Multer.File) {
        return this.userService.updateProfile(dto,user,file)
    }
    @UseGuards(JwtAuthGuard)
    @Delete('/me')
    async deleteUser(@Body() dto: DeleteUserDto,@CurrentUser() user: UserPayLoad) {
        return this.userService.deleteUser(dto,user)
    }
}
