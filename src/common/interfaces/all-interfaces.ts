import { Request } from 'express'
import { Prisma } from '@prisma/client';

//  Auth 
export interface UserPayLoad {
  id: string
  name: string
  role: string
}

export interface AuthRequest extends Request {
  user?: UserPayLoad
}

// Pagination 
export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    prevPage: number | null
    nextPage: number | null
  }
}
type Profile= Prisma.UserGetPayload<{
  select: {
    id: true,
    name: true,
    email: true,
    avatarUrl: true
  }
}>

export interface GetProfileResponse {
  success: boolean
  data: Profile
}
export interface UpdateProfileResponse {
  success: boolean
  message: string
  data: Profile
}


//  Tasks 
export type TaskProject = Prisma.TaskGetPayload<{
  include: {
    users: { select: { id: true; name: true; email: true } }
    project: { select: { id: true; name: true } }
  }
}>

export interface CreateTaskResponse {
  success: boolean
  message: string
  data: TaskProject
}

export interface TaskResponse {
  success: boolean
  data: TaskProject
}

export interface UpdateTaskResponse {
  success: boolean
  message: string
  data: TaskProject
}

//  Projects
export type ProjectWithUsers = Prisma.ProjectGetPayload<{
  include: {
    users: { select: { id: true; name: true; email: true } }
    tasks: { select: { id: true; title: true } }
  }
}>

export interface CreateProjectResponse {
  success: boolean
  message: string
  data: ProjectWithUsers
}

export interface ProjectResponse {
  success: boolean
  data: ProjectWithUsers
}

export interface UpdateProjectResponse {
  success: boolean
  message: string
  data: ProjectWithUsers
}

// Delete 
export interface DeleteResponse {
  success: boolean
  message: string
}

// Admin Dashboard 
export interface AdminDashboardResponse {
  success: boolean
  message: string
  data: {
    totalUsers: number
    totalProjects: number
    totalTasks: number
    completedTasks: number
  }
}

// Admin Users
export type AdminUserData = Prisma.UserGetPayload<{
  select: {
    id: true
    name: true
    email: true
    role: true
    createdAt: true
    updatedAt: true
    projects: { select: { id: true; name: true; ownerId: true } }
    tasks: {
      select: { id: true; title: true; status: true; priority: true; createdAt: true }
    }
  }
}>


export interface AdminUserResponse {
  success: boolean
  data: AdminUserData
}

//  Admin Update Role 
export type AdminUpdateRole = Prisma.UserGetPayload<{
  select: { id: true; name: true; role: true }
}>

export interface AdminUpdateUserRole {
  success: boolean
  message: string
  data: AdminUpdateRole
}

// Admin Projects 
export type AdminProjectData = Prisma.ProjectGetPayload<{
  select: {
    id: true
    name: true
    description: true
    ownerId: true
    createdAt: true
    updatedAt: true
    users: { select: { id: true, name: true, email: true, role: true } }
    tasks: {
      select: { id: true, title: true, status: true, priority: true, createdAt: true }
    }
  }
}>

export interface AdminProjectResponse {
  success: boolean
  data: AdminProjectData
}
export interface AdminUpdateProjectResponse {
  success: boolean
  message: string
  data: AdminProjectData
}

//  Admin Tasks 
export type AdminTaskData = Prisma.TaskGetPayload<{
 include: {
    users: {
        select: {
            id: true,
            name: true,
            email: true,
            role: true
            },
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
}>

export interface AdminTaskResponse {
  success: boolean
  data: AdminTaskData
}

export interface AdminUpdateTask{
  success: boolean,
  message: string,
  data: AdminTaskData
}