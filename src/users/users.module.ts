import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtAuthGuard } from 'src/common/guard/jwt-auth.guard';
import { PrismaModule } from 'src/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports : [PrismaModule,JwtModule.register({
    secret: process.env.JWT || 'anythingfornow',
    signOptions: {expiresIn: '1d'}
  })],
  providers: [UsersService,JwtAuthGuard],
  controllers: [UsersController]
})
export class UsersModule {}
