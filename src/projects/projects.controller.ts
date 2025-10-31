import { Body, Controller, Post,Get,Put,Delete, Query, UseGuards, Param } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import {  UserPayLoad } from 'src/common/interfaces/all-interfaces';
import { CurrentUser } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { PaginateDto } from 'src/common/paginate/paginate';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectService: ProjectsService) {}

    @UseGuards(JwtAuthGuard)
    @Post('/')
    async createProject(@Body() dto: CreateProjectDto, @CurrentUser() user: UserPayLoad) {
        return this.projectService.createProject(dto,user)
    }

    @UseGuards(JwtAuthGuard)
    @Get('/')
    async getProjects(@Query() dto: PaginateDto, @CurrentUser() user: UserPayLoad) {
        return this.projectService.getProjects(dto,user)
    }
    @UseGuards(JwtAuthGuard)
    @Get('/:id')
    async getProject(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.projectService.getProject(id,user)
    }

    @UseGuards(JwtAuthGuard)
    @Put('/:id')
    async updateProject(@Param('id') id: string, @Body() dto: UpdateProjectDto,@CurrentUser() user: UserPayLoad) {
        return this.projectService.updateProject(id,dto,user)
    }

    @UseGuards(JwtAuthGuard)
    @Delete('/:id')
    async deleteProject(@Param('id') id: string, @CurrentUser() user: UserPayLoad) {
        return this.projectService.deleteProject(id,user)
    }

}
