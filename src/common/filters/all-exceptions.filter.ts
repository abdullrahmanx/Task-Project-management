import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from "@nestjs/common";
import { ThrottlerException } from "@nestjs/throttler";
import { Prisma } from "@prisma/client";



// btget response


@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    let status: number = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: any;


    if (exception instanceof ThrottlerException) {
      status= HttpStatus.TOO_MANY_REQUESTS
      message = {
        success: false,
        message: 'Too many requests, try again later'
      }
    }

    else if (exception instanceof HttpException) {
      status= HttpStatus.BAD_REQUEST
      message= exception.getResponse()
    } 
    
    

    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      if(exception.code === 'P2002') {
        status= HttpStatus.BAD_REQUEST
        message= {
          success: false,
          message: `Duplicated field: ${Array.isArray(exception.meta?.target) ? exception.meta.target.join(', ')
            : exception.meta?.target
          }`
        }

      }

      else if (exception.code === 'P2003'){
        status= HttpStatus.BAD_REQUEST
        message= {
          success: false,
          message: `Foreign key error: ${exception.meta?.field_name ?? 'related field'}`
        }
      }

      else if(exception.code === 'P2000') {
        status= HttpStatus.BAD_REQUEST
        message= {
          success: false,
          message: 'Invalid value'
        }
      } 
      
      else {
        status= HttpStatus.INTERNAL_SERVER_ERROR
        message= {
          success: false,
          message: 'Internal server error'
        }
      }
    }
    
    else {
      status= HttpStatus.INTERNAL_SERVER_ERROR
      message= {
        success: false,
        message: 'Internal server error'
      }
    }
    response.status(status).json({
      ...message,
      timestamps: new Date().toISOString(),
    })
  }
}