import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UserPayLoad,
     ProjectResponse,
     CreateProjectResponse,
     UpdateProjectResponse,
     DeleteResponse,
     PaginatedResponse} from 'src/common/interfaces/all-interfaces';
import { ProjectWithUsers } from 'src/common/interfaces/all-interfaces';
import { buildFindManyQuery, PaginateDto } from 'src/common/paginate/paginate';
import { UpdateProjectDto } from './dto/update-project.dto';
@Injectable()
export class ProjectsService {
    constructor(private readonly prisma: PrismaService) {}

    async createProject(dto: CreateProjectDto,user: UserPayLoad): Promise<CreateProjectResponse> {
        if(dto.membersIds && dto.membersIds.length > 0) {
           
            const existingUser= await this.prisma.user.findMany({
                where: {id: {in: dto.membersIds}},
                select: {id: true}
            })

            if(existingUser.length !== dto.membersIds?.length) {
                throw new BadRequestException("One or more IDs are invalid")
            }
        }
        const membersIds= [...new Set([user.id,
            ...(user.role === 'admin'&& dto.membersIds ? dto.membersIds: [])
        ])]


        const project = await this.prisma.project.create({
            data: {
                name: dto.name,
                ...(dto.description !== undefined && {description: dto.description}),
                ownerId: user.id,
                users: {
                    connect: membersIds.map((id) => ({id}))
                }
            },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tasks: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        }) 
        return {
                success: true,
                message: 'Project created successfully',
                data: project
        } 
    }

    async getProjects(dto: PaginateDto, user: UserPayLoad): Promise<PaginatedResponse<ProjectWithUsers>> {

        const {query,paginate}= buildFindManyQuery({...dto, user: user.id}, {
            searchFields: ['name','description'],
            allowedSortFields: ['createdAt'],
            relationField: 'users',
            relationType: 'many'
        })

        const [projects,total] = await Promise.all([
            this.prisma.project.findMany({...query,
                include : {
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    tasks: {
                        select: {
                            id: true,
                            title: true
                        }
                    }
                }
            }) as Promise<ProjectWithUsers[]>,
            this.prisma.project.count({where: query.where})
        ])

        const totalPages= total/paginate.limit

        return {
            success: true,
            data: projects,
            pagination : {
                page: paginate.page,
                limit: paginate.limit,
                total,
                prevPage: paginate.page > 1 ? paginate.page - 1 : null,
                nextPage: paginate.page < totalPages ? paginate.page + 1 : null,
                totalPages,
            }
        }
    }

    async getProject(projectId: string,user: UserPayLoad): Promise<ProjectResponse> {

        const project= await this.prisma.project.findFirst({
            where: {
                id: projectId,
                users: {
                    some: {
                        id: user.id
                    }
                }
            },
            include: {
                users: {
                    select: {
                    id: true,
                    name: true,
                    email: true
                    }
                },
                tasks: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        if(!project) throw new NotFoundException('Project not found')

        return {
            success: true,
            data: project
        }    
    }

    async updateProject(projectId: string,dto: UpdateProjectDto,user: UserPayLoad): Promise<UpdateProjectResponse> {
        
        const project= await this.prisma.project.findUnique({
            where: {
                id: projectId,
            }
        })

        if(!project) {
            throw new NotFoundException('Project not found')
        }
        if(project.ownerId !== user.id) {
            throw new UnauthorizedException('You are not allowed to update this project')
        }
       
        if(dto.membersIds && dto.membersIds.length > 0) {
            if(project.ownerId !== user.id && user.role != 'ADMIN') {
                throw new UnauthorizedException('You are not allowed to update this project')
            }
            const users= await this.prisma.user.findMany({
                where: {
                    id: {in: dto.membersIds}
                },
                select: {
                    id: true
                }
            })
            if(users.length !== dto.membersIds.length) {
                throw new BadRequestException('One or more IDs are invalid')
            }
        }

        const updatedProject= await this.prisma.project.update({
            where :{
                id: projectId
            },
            data: {
                ...(dto.name !== undefined && {name: dto.name}),
                ...(dto.description !== undefined && {description: dto.description}),
                ...(dto.membersIds !== undefined && {users: {
                    connect: dto.membersIds.map((id) => ({id}))
                }})
            },
            include :{
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                tasks :{
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })
        return {
            success: true,
            message: 'Project updated successfully',
            data: updatedProject
        }
    }

    async deleteProject(projectId: string, user: UserPayLoad): Promise<DeleteResponse> {

        const project= await this.prisma.project.findUnique({
            where: {
                id: projectId
            }
        })

        if(!project){
            throw new NotFoundException('Project not found')
        }

        if(project.ownerId !== user.id && user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only admin and project owner can delete projects')
        }

        await this.prisma.project.delete({
            where : {
                id: projectId
            }
        })

        return {
            success : true,
            message: 'Project deleted successfully'
        }
    }

}
