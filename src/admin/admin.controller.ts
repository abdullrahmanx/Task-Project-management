import { Controller,Get,Post,Put,Delete, UseGuards, Query, Param, Body } from '@nestjs/common';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { AdminGuard } from 'src/common/guard/role-admin.guard';
import { AdminDto, PaginateDto } from 'src/common/paginate/paginate';
import { UpdateUserRoleDto } from './dto/update-user-dto';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { AdminUpdateTaskDto } from './dto/update-task.dto';
import { AdminUpdateProjectDto } from './dto/update-project.dto';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}
    

    @UseGuards(JwtAuthGuard,AdminGuard)
    @Get('/dashboard')
    async getDashboardStats() {
        return this.adminService.getDashboardStats()
    }
    
    @UseGuards(JwtAuthGuard,AdminGuard)
    @Get('/users')
    async getAllUsers(@Query() dto: AdminDto) {
        return this.adminService.getAllUsers(dto)
    }
    @UseGuards(JwtAuthGuard,AdminGuard)
    @Get('/users/:id')
    async getUser(@Param('id') id: string) {
        return this.adminService.getUser(id)
    }
    
    @UseGuards(JwtAuthGuard,AdminGuard)
    @Put('/role/:id')
    async updateUserRole (@Param('id') id: string, @Body() dto: UpdateUserRoleDto) {
        return this.adminService.updateUserRole(id,dto)
    }
    @UseGuards(JwtAuthGuard,AdminGuard)
    @Delete('/users/:id')
    async deleteUser(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.adminService.deleteUser(id,user)
    }

    @UseGuards(JwtAuthGuard,AdminGuard)
    @Get('/projects')
    async getProjects(@Query() dto: AdminDto ) {
        return this.adminService.getProjects(dto)
    }

    @UseGuards(JwtAuthGuard,AdminGuard)
    @Get('/projects/:id')
    async getProject(@Param('id') id: string ) {
        return this.adminService.getProject(id)
    }

    @UseGuards(JwtAuthGuard,AdminGuard)
    @Put('/projects/:id')
    async updateProject(@Param('id') id: string, @Body() dto: AdminUpdateProjectDto) {
        return this.adminService.updateProject(id,dto)
    }

    @UseGuards(JwtAuthGuard,AdminGuard)
    @Delete('/projects/:id')
    async deleteProject(@Param('id') id: string) {
        return this.adminService.deleteProject(id)
    }

    @UseGuards(JwtAuthGuard,AdminGuard)
    @Get('/tasks')
    async getTasks(@Query() dto: PaginateDto ) {
        return this.adminService.getTasks(dto)
    }
    @UseGuards(JwtAuthGuard,AdminGuard)
    @Get('/tasks/:id')
    async getTask(@Param('id') id: string ) {
        return this.adminService.getTask(id)
    }
     
    @UseGuards(JwtAuthGuard,AdminGuard)
    @Put('/tasks/:id')
    async updateTask (@Param('id') id: string, @Body() dto: AdminUpdateTaskDto) {
        return this.adminService.updateTask(id,dto)
    }

    @UseGuards(JwtAuthGuard,AdminGuard)
    @Delete('/tasks/:id')
    async deleteTask(@Param('id') id: string) {
        return this.adminService.deleteTask(id)
    }
}
