import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AuthRequest, UserPayLoad } from "../interfaces/all-interfaces";

export const CurrentUser= createParamDecorator(
 (data: unknown, ctx: ExecutionContext): UserPayLoad => {
    const request= ctx.switchToHttp().getRequest<AuthRequest>()
    return request.user as UserPayLoad
  }
)