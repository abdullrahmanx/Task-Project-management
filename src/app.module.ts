import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { ProjectsModule } from './projects/projects.module';
import { PrismaService } from './prisma/prisma.service';
import { UsersModule } from './users/users.module';
import { AdminModule } from './admin/admin.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [ThrottlerModule.forRoot([{
    ttl: 60000,
    limit: 10
  }]),AuthModule, TasksModule, ProjectsModule, UsersModule, AdminModule],
  providers: [
  PrismaService,
  {
    provide: APP_GUARD,
    useClass: ThrottlerGuard, 
  }
],
})
export class AppModule {}
