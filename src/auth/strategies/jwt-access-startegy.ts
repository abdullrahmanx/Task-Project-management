import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import{ ExtractJwt,Strategy} from 'passport-jwt'
import { PrismaService } from "src/prisma/prisma.service";
import { UnauthorizedException } from "@nestjs/common";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy,'jwt') {
    constructor(configService: ConfigService, private readonly prisma: PrismaService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.get('JWT_ACCESS_SECRET'),
            passReqToCallback: true, 
        })
    }

    async validate(req: Request, payload: any) {
        
        const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req)

        const blacklist= await this.prisma.blacklist.findUnique({
            where: {
                token
            }
        })
        
        if(blacklist) {
            throw new UnauthorizedException('Access token has been revoked');
        }
        
        return {id: payload.id, name: payload.name, role: payload.role}
    }

}