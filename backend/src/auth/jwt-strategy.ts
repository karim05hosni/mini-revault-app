import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import { ConfigService } from '@nestjs/config';
import { ExtractJwt, Strategy as JwtStrategyBase } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(JwtStrategyBase) {
    constructor(private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
        });
    }

    async validate(payload: { sub: string; role: string; email: string }) {
        return {
            userId: payload.sub,
            role: payload.role,
            email: payload.email,
        };
    }
}
