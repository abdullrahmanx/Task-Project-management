import { Injectable, CanActivate,ExecutionContext, ForbiddenException } from "@nestjs/common";
import { AuthRequest, UserPayLoad } from "../interfaces/all-interfaces";
import { Observable } from "rxjs";

export class AdminGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        
        const request= context.switchToHttp().getRequest<AuthRequest>()

        const user= request.user as UserPayLoad
        if(!user || user.role !== 'ADMIN') {
            throw new ForbiddenException('Only admin can access this')
        }
        return true
    }
}