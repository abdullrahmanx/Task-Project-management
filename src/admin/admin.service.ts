import {BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { 
  AdminDashboardResponse,
  AdminProjectData,
  AdminProjectResponse,
  AdminUserData,
  AdminUserResponse,
  AdminUpdateUserRole,
  DeleteResponse,
  PaginatedResponse,
  UserPayLoad,
  AdminTaskData,
  AdminTaskResponse,
  AdminUpdateTask,
  AdminUpdateProjectResponse
} from 'src/common/interfaces/all-interfaces';
import { TaskStatus,TaskPriority } from '@prisma/client';
import { AdminDto, buildFindManyQuery, PaginateDto } from 'src/common/paginate/paginate';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateUserRoleDto } from './dto/update-user-dto';
import { AdminUpdateTaskDto } from './dto/update-task.dto';
import { AdminUpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class AdminService {
    constructor(private readonly prisma: PrismaService) {}

    async getDashboardStats(): Promise<AdminDashboardResponse> {
        const [users,projects,tasks,completedTasks] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.project.count(),
            this.prisma.task.count(),
            this.prisma.task.count({where: {status: 'DONE'}})
        ])
        return {
            success: true,
            message: 'Dashboard stats fetched successfully',
            data: {
                totalUsers: users,
                totalProjects: projects,
                totalTasks: tasks,
                completedTasks
            }
        }
    }

    async getAllUsers(dto: AdminDto): Promise<PaginatedResponse<AdminUserData>> {
       
        const {query,paginate}= buildFindManyQuery(dto,{
            searchFields: ['name','email'],
            allowedSortFields: ['createdAt','updatedAt','role'],
        })

        if(dto.role) {
            query.where.role= dto.role
        }
        
        const [users,total]= await Promise.all([this.prisma.user.findMany({...query,
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                        projects: {
                            select: {
                                id: true,
                                name: true,
                                ownerId: true
                            },
                            take: 3
                        },
                        tasks: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                priority: true,
                                createdAt: true
                            },
                            take: 5
                        }
                    }
                }), this.prisma.user.count({where: query.where})],
        )
        const totalPages= Math.ceil(total/paginate.limit)
        return {
            success: true,
            data: users,
            pagination: {
                page: paginate.page,
                limit: paginate.limit,
                total,
                prevPage: paginate.page > 1 ?  paginate.page - 1 : null,
                nextPage: paginate.page < totalPages ? paginate.page + 1 : null,
                totalPages
            }
        }
    }

    async getUser(id: string): Promise<AdminUserResponse> {
        const user= await this.prisma.user.findUnique({
            where: {
                id
            },
               select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                    projects: {
                        select:{
                            id: true,
                            name: true,
                            ownerId: true,
                        }
                    },
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            priority: true,
                            createdAt: true,
                        }
                } 
        }
        })

        if(!user) {
            throw new UnauthorizedException('User not found')
        }
        return {
            success: true,
            data: user
        }
    }

    async updateUserRole(id: string, dto: UpdateUserRoleDto): Promise<AdminUpdateUserRole> {
        const user= await this.prisma.user.findUnique({
            where: {
                id
            }
        })
        if(!user) throw new NotFoundException('User not found')
        const updatedUserRole= await this.prisma.user.update({
           where: {
                id
           },
           data: {
                role: dto.role
           },
           select: {
            id: true,
            name: true,
            role: true
           }
        })

        return {
            success: true,
            message: 'User role updated',
            data: updatedUserRole
        }
    }

    async deleteUser(id: string,user: UserPayLoad): Promise<DeleteResponse> {
        const deleteUser= await this.prisma.user.findUnique({
            where: {id}
        })
        if(!deleteUser) {
            throw new NotFoundException('User not found')
        }
        if(user.id === id) {
            throw new ForbiddenException('You cannot delete your own account')
        }
        if(deleteUser.role === 'ADMIN') {
            throw new ForbiddenException('You cant delete another admin')
        }
        
        
        await this.prisma.user.delete({
            where: {
                id
            }
        })
        return {
            success: true,
            message: 'User deleted successfully'
        }
    }

    async getProjects(dto: PaginateDto): Promise<PaginatedResponse<AdminProjectData>> {

        const {query,paginate} = buildFindManyQuery(dto, {
            searchFields: ['name','description','ownerId'],
            allowedSortFields: ['createdAt','updatedAt']
        })

        const [projects,total] = await Promise.all([
            this.prisma.project.findMany({...query,
                select: {
                    id: true,
                    name: true,
                    description: true,
                    ownerId: true,
                    createdAt: true,
                    updatedAt: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        },
                        take: 3
                    },
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            priority: true,
                            createdAt: true
                        },
                        take: 3
                    }
                }
            }),
            this.prisma.project.count({where: query.where})
        ])
        const totalPages= Math.ceil(total/paginate.limit)

        return {
            success: true,
            data: projects,
            pagination: {
                page: paginate.page,
                limit: paginate.limit,
                total,
                prevPage: paginate.page > 1 ? paginate.page - 1 : null,
                nextPage: paginate.page < totalPages ? paginate.page + 1 : null,
                totalPages
            }
        }
    }
    async getProject(id: string): Promise<AdminProjectResponse> {
        const project = await this.prisma.project.findUnique({
            where: {
                id
            },
            select: {
                    id: true,
                    name: true,
                    description: true,
                    ownerId: true,
                    createdAt: true,
                    updatedAt: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            priority: true,
                            createdAt: true
                        }
                    }
            }
        })
        if(!project) {
            throw new NotFoundException('Project not found')
        }
        return {
            success: true,
            data: project
        }
    }
    async updateProject(id: string, dto: AdminUpdateProjectDto): Promise<AdminUpdateProjectResponse> {
        
        const project= await this.prisma.project.findUnique({
            where: {
                id
            },
        })
        if(!project) {
            throw new NotFoundException('Project not found')
        }
       
        

        if(dto.membersIds&& dto.membersIds.length > 0) {
            
            const users= await this.prisma.user.findMany({
                where: {
                    id: {in: dto.membersIds}
                },
            })
            
            if(users.length !== dto.membersIds.length) {
                throw new BadRequestException('One or more IDS are invalid')
            }
        }

        const updatedProject = await this.prisma.project.update({
            where: {
                id
            },
            data: {
                ...(dto.name !== undefined && {name: dto.name}),
                ...(dto.description !== undefined && {description: dto.description}),
                ...(dto.owner !== undefined && {ownerId: dto.owner}),
                ...(dto.membersIds !== undefined && dto.membersIds.length> 0 && {
                    users: {
                        set: [],
                        connect: dto.membersIds.map((id) => ({id}))
                    }
                })
            },
            select: {
                    id: true,
                    name: true,
                    description: true,
                    ownerId: true,
                    createdAt: true,
                    updatedAt: true,
                    users: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true
                        }
                    },
                    tasks: {
                        select: {
                            id: true,
                            title: true,
                            status: true,
                            priority: true,
                            createdAt: true
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

    async deleteProject(id: string): Promise<DeleteResponse> {
        const project= await this.prisma.project.findUnique({
            where: {
                id
            }
        })
        if(!project) {
            throw new NotFoundException('Project not found')
        }
        
        await this.prisma.project.delete({where: {id}})
        return {
            success: true,
            message: 'Project deleted successfully'
        }
    }
    async getTasks(dto: PaginateDto): Promise<PaginatedResponse<AdminTaskData>> {
        const {query,paginate}= buildFindManyQuery(dto, {
            searchFields: ['title','description','status','priority','createdById'],
            allowedSortFields: ['status','priority','title','createdAt','updatedAt']
        })

        const [tasks,total]= await Promise.all([
            this.prisma.task.findMany({...query,
                include: {
                    users: {
                        select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                      },
                      take: 5
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            owner: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        },
                    },
                },
            }),
            this.prisma.task.count({where: query.where})
        ])

        const totalPages= Math.ceil(total/paginate.limit)
        return {
            success: true,
            data: tasks,
            pagination: {
                page: paginate.page,
                limit: paginate.limit,
                total,
                prevPage: paginate.page > 1 ? paginate.page - 1 : null,
                nextPage: paginate.page < totalPages ? paginate.page + 1 : null,
                totalPages
            }
        }
    }

    async getTask(id: string): Promise<AdminTaskResponse> {
        const task= await this.prisma.task.findUnique({
            where: {
                id
            },
            include: {
                users: {
                        select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                      },
                      take: 5
                    },
                    project: {
                        select: {
                            id: true,
                            name: true,
                            description: true,
                            owner: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        },
                    },

            }
        })

        if(!task) {
            throw new NotFoundException('Task not found')
        }

        return {
            success: true,
            data: task
        }
    }
  
    async updateTask(id: string,dto: AdminUpdateTaskDto): Promise<AdminUpdateTask> {
        const task= await this.prisma.task.findUnique({
            where: {
                id
            }
        })
        if(!task) {
            throw new NotFoundException('Task not found')
        }
        if(dto.assignedToIds && dto.assignedToIds.length > 0) {
            const users= await this.prisma.user.findMany({
                where: {
                    id: {
                        in: dto.assignedToIds
                    }
                }
            })

            if(users.length !== dto.assignedToIds.length) {
                throw new BadRequestException('One or more IDS are invalid')
            }
        }
         const updatedTask= await this.prisma.task.update({where: {id},
                    data: {
                        ...(dto.title !== undefined && {title: dto.title}),
                        ...(dto.description !== undefined && {description: dto.description}),
                        ...(dto.status !== undefined && {status: dto.status as TaskStatus}),
                        ...(dto.priority !== undefined && {priority: dto.priority as TaskPriority}),
                        ...(dto.dueDate !== undefined && {dueDate: new Date(dto.dueDate)}),
                        ...(dto.assignedToIds !== undefined && {users: {
                            set: [],
                            connect: dto.assignedToIds.map((id) => ({id}))}}),
                            }, include: {
                                    users: {
                                        select: {
                                            id: true,
                                            name: true,
                                            email: true,
                                            role: true
                                        }
                                    },
                                    project: {
                                        select: {
                                            id: true,
                                            name: true,
                                            description: true,
                                            owner: {
                                                select : {
                                                    id: true,
                                                    name: true
                                                }
                                            }
                                        }
                                    }
        }})
        return {
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        }
    }
    async deleteTask(id: string): Promise<DeleteResponse> {
        const task= await this.prisma.task.findUnique({
            where: {
                id
            }
        })
        if(!task) {
            throw new UnauthorizedException('Task not found')
        }

        await this.prisma.task.delete({
            where: {
                id
            }
        })
        return {
            success: true,
            message: 'Task deleted successfully'
        }

    }
}
