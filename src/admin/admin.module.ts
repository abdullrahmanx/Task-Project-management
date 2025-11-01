import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { AdminGuard } from 'src/common/guard/role-admin.guard';
import { AuthModule } from 'src/auth/auth.module';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminService,AdminGuard,PrismaService]
})
export class AdminModule {}
