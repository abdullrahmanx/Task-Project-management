import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  providers: [ProjectsService,JwtAuthGuard],
  controllers: [ProjectsController]
})
export class ProjectsModule {}
