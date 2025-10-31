import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [TasksService,JwtAuthGuard],
  controllers: [TasksController]
})
export class TasksModule {}
