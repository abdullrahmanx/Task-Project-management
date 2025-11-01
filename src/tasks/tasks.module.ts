import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule,CloudinaryModule],
  providers: [TasksService,PrismaService],
  controllers: [TasksController]
})
export class TasksModule {}
