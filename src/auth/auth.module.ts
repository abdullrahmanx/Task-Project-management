import { Module } from '@nestjs/common';
import { AuthGuard, PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt-access-startegy';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
    imports: [
    PassportModule.register({defaultStrategy: 'jwt'}),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: {expiresIn: '15min'}
      })
    }),
    ConfigModule
    ],
    controllers: [AuthController],
    providers: [AuthService,JwtStrategy, PrismaService],
})
  export class AuthModule {}
