import { Controller,Body, Post, UseGuards, Get,Put,Query, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { CreateTaskDto } from './dto/create-task.dto';
import {  UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { UpdateTaskDto } from './dto/update-task.dto';
import { MoveTaskDto } from './dto/move-task.dto';
import {  TaskQueryDto } from 'src/common/paginate/paginate';
import { UpdateStatusPriorityDto } from './dto/update-status-priority.dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('tasks')
export class TasksController {
    constructor(private readonly taskService: TasksService) {}

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files',5))
    @Post('/')
    async createTask (@Body() dto: CreateTaskDto, @CurrentUser() user: UserPayLoad,
    @UploadedFiles() files?: Express.Multer.File[]
    ){
        return this.taskService.createTask(dto,user,files)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getTasks(@Query() dto: TaskQueryDto, @CurrentUser() user: UserPayLoad) {
        return this.taskService.getTasks(dto,user)
    }
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getTask(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.taskService.getTask(id,user)
    }
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FilesInterceptor('files',5))
    @Put('/:id')
    async updateTask(@Param('id') id: string, @Body() dto: UpdateTaskDto,
    @CurrentUser() user: UserPayLoad, @UploadedFiles() files?: Express.Multer.File[]) {
        return this.taskService.updateTask(id,dto,user,files)
    }
    @UseGuards(JwtAuthGuard)
    @Put('/status/:id')
    async updatePriorityStatus(@Param('id') id: string, @Body() dto: UpdateStatusPriorityDto, @CurrentUser() user: UserPayLoad) {
        return this.taskService.updatePriorityStatus(id,dto,user)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/move-task/:id')
    async moveTask(@Param('id') id: string, @Body() dto: MoveTaskDto, @CurrentUser() user: UserPayLoad) {
        return this.taskService.moveTask(id,dto,user)
    }
    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteTask(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.taskService.deleteTask(id,user)
    }

}
