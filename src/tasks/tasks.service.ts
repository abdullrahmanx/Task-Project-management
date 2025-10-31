import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { CreateTaskResponse, TaskResponse, UpdateTaskResponse, UserPayLoad,  DeleteResponse, PaginatedResponse, TaskProject } from 'src/common/interfaces/all-interfaces';
import { buildFindManyQuery, TaskQueryDto} from 'src/common/paginate/paginate';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { MoveTaskDto } from './dto/move-task.dto';
import { UpdateStatusPriorityDto } from './dto/update-status-priority.dto';

@Injectable()
export class TasksService {
    constructor(private readonly prisma: PrismaService) {}

 async createTask (dto: CreateTaskDto, user: UserPayLoad): Promise<CreateTaskResponse>{
        return dto.projectId ? this.createProjectTask(dto,user) : this.createPersonalTask(dto,user)
    }   

    private async createProjectTask (dto: CreateTaskDto, user: UserPayLoad): Promise<CreateTaskResponse> {
        
        const project= await this.prisma.project.findFirst({where: {id: dto.projectId}})
        
        if(!project) throw new NotFoundException('Project not found')
        
        if(project.ownerId !== user.id && user.role !== 'ADMIN') {
            throw new UnauthorizedException('Only owner and admins can create tasks and add members')  
        }
        if(dto.userIds && dto.userIds.length > 0) {
            const projectMembers = await this.prisma.user.findMany({
                where: {
                    id: { in: dto.userIds },
                    projects: { some: { id: dto.projectId } }
                }
       })
    
        if(projectMembers.length !== dto.userIds.length) {
            throw new BadRequestException('All assignees must be project members')
            }
        }
        const task= await this.prisma.task.create({
            data : {
                title: dto.title,
                description: dto.description ?? '',
                status: dto.status,
                priority: dto.priority,
                dueDate: new Date(dto.dueDate),
                createdBy : {
                    connect: {id: user.id}
                },
                users: {
                    connect : [
                        ...(dto.userIds?.map((id) => ({id})) || []),
                        {id: user.id}
                    ]
                },
                project: {
                    connect :{id: dto.projectId}
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
               project: {
                    select: {
                        id: true,
                        name: true,
                    }
                }
            },
        })  
        return { 
                success: true,
                 message: 'Task created successfully',
                 data: task
        }
    }
 

    private async createPersonalTask(dto: CreateTaskDto, user: UserPayLoad): Promise<CreateTaskResponse> {

            const task = await this.prisma.task.create({
                data: {
                    title: dto.title,
                    description: dto.description || 'nothing for now',
                    status: dto.status,
                    priority: dto.priority,
                    dueDate: new Date(dto.dueDate),
                    createdBy: {
                        connect : {id: user.id}
                    },
                    users: {
                        connect: {id: user.id}
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
                project: {
                    select: {
                        id: true,
                       name: true
                    }
                }
        }
        })
        return {  
                    success: true,
                    message: 'Task created successfully',
                    data: task
                }
        
    }
    

  async getTasks (dto: TaskQueryDto, user: UserPayLoad):Promise<PaginatedResponse<TaskProject>> {
        
        const {query,paginate} = buildFindManyQuery({...dto,user: user.id},{
            allowedSortFields: ['createdAt'],
            searchFields: ['name','description'],
            relationField: 'users',
            relationType: 'many'
        })

        if(user.role === 'ADMIN') {
            delete query.where.users
        }

        const [tasks,total]= await Promise.all([
            this.prisma.task.findMany({...query,
                include: {
                    users: {
                        select: {
                            id: true,
                            name: true ,
                            email: true
                        }
                    },
                    project: {
                        select: {
                            id: true,
                            name: true
                        }
                    } 
                }
            }),
            this.prisma.task.count({where: query.where})
        ])

        const totalPages =Math.ceil(total/paginate.limit)
        return {
                success: true,
                data: tasks,
                pagination: {
                page: paginate.page,
                limit: paginate.limit,
                total,
                totalPages,
                prevPage: paginate.page > 1 ? paginate.page -1 : null,
                nextPage: paginate.page < totalPages ?  paginate.page + 1 : null
            }
        }
  }

  async getTask(taskId: string,user: UserPayLoad): Promise<TaskResponse> {
    
        const task= await this.prisma.task.findFirst({where: {
            id: taskId,
            createdById: user.id
        },
        include: {
            users: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            },
            project: {
                select: {
                    id: true,
                    name: true
                }
            }
        }})
        
        if(!task) throw new NotFoundException('Task not found')

        return {
            success: true,
            data: task
        }
  }
  private async getTaskWithAccess(taskId: string, user: Record<string, any>) {
    return  this.prisma.task.findFirst({
        where: {
            id: taskId,
            OR: [
                {createdById: user.id},
                {project: {
                    ownerId: user.id
                }}
            ]
        },
        include: {
            project: true,
            createdBy: {
                select: {id: true, name: true, email: true}
            }
        }
    })

  }
  async updateTask(taskId: string, dto: UpdateTaskDto,user: UserPayLoad): Promise<UpdateTaskResponse> {
   
           const task = await this.getTaskWithAccess(taskId,user)
            if(!task) throw new NotFoundException('Task not found')

            if(task.projectId) {
                if(user.role !== 'ADMIN' && task.project?.ownerId !== user.id) {
                    throw new UnauthorizedException('Only project owner and admin can update project tasks')
                }   
            }

            const updatedTask= await this.prisma.task.update({where: {id: taskId},
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
                                    email: true
                                }
                            },
                            project: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                    }})

            return {success: true,message: 'Task edited successfully',data: updatedTask}
    }

    
   async updatePriorityStatus(taskId: string, dto: UpdateStatusPriorityDto,user: UserPayLoad)
   :Promise<UpdateTaskResponse> {
        const task= await this.getTaskWithAccess(taskId,user)

        if(!task) {
            throw new NotFoundException('Task not found')
        }
        
        if(task.projectId) {
            if(task.project?.ownerId !== user.id && user.role !== 'admin') {
                throw new ForbiddenException('Only project owner and admin can update project tasks')
            }
        }

        const updatedTask =await this.prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                ...(dto.status !== undefined && {status: dto.status}),
                ...(dto.priority !== undefined && {priority: dto.priority})
            },include: {
                users: {
                    select: {id: true, name: true, email: true}
                },
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        })
        return {
            success: true,
            message: 'Task updated successfully',
            data: updatedTask
        }
    
    }

  async moveTask(taskId: string, dto: MoveTaskDto, user: UserPayLoad): Promise<UpdateTaskResponse> {
        console.log(dto.targetProjectId)
        const task= await this.getTaskWithAccess(taskId,user)

        if(!task) throw new NotFoundException('Task not found')
            
        if(dto.targetProjectId !== undefined && dto.targetProjectId !== null) {
            const project= await this.prisma.project.findFirst({
                where: {
                    id: dto.targetProjectId,
                    ownerId: user.id
                }
            })
            if(!project) {
                throw new UnauthorizedException('Project not found or you must be the owner')
            }
            if(dto.assignedToIds && dto.assignedToIds.length > 0) {
                const users= await this.prisma.user.findMany({
                    where: {
                        id: {
                            in: dto.assignedToIds
                        },
                        projects: {
                            some: {
                                id: dto.targetProjectId
                            }
                        }
                    },
                   
                })

                if(users.length !== dto.assignedToIds.length) {
                    throw new BadRequestException('All assignees must be members of the target project')
                }
            }
        }else {
            if(dto.targetProjectId === null) {
                if(dto.assignedToIds && (dto.assignedToIds.length > 1 || dto.assignedToIds[0] !== user.id)) {
                    throw new BadRequestException('Personal tasks can only be assigned to yourself')
                }
            }
        }

        const movedTask= await this.prisma.task.update({
            where: {
                id: taskId
            },
            data: {
                ...(dto.targetProjectId !== undefined && {projectId: dto.targetProjectId}),
                ...(dto.assignedToIds !== undefined && {
                    users: {
                        set: [],
                        connect: dto.assignedToIds.map((id) => ({id}))
                    }
                })
            },
            include: {
                users: {
                    select: {id: true, name: true, email: true}
                },
                project: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        }) 

        return {success: true, message: 'Task moved successfully', data: movedTask}
    }

    async deleteTask (taskId: string, user: UserPayLoad): Promise<DeleteResponse> {

        const task= await this.getTaskWithAccess(taskId,user)
      
        if(!task) {
            throw new UnauthorizedException('Task not found or you are not the owner')
        }
        if(task.projectId &&  task.project?.ownerId !== user.id && task.createdById !== user.id) {
            throw new UnauthorizedException('You are not allowed to delete this task')
        }

         await this.prisma.task.delete({where: {id: taskId}})

        return {
            success: true,
            message: 'Task deleted successfully'
        }
    }
}
