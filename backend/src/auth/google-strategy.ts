import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile  } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor(
        configService: ConfigService,
        private authService: AuthService,
    ) {
        super(
            {
                clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
                clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
                callbackURL: configService.getOrThrow<string>('GOOGLE_CALLBACK_URL'),
                scope: ['email', 'profile'],
            }
        );
    }

    async validate(
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: VerifyCallback,
    ) {
        console.log('Google profile received:', profile);
        // const { emails, name } = profile;
        if (!profile.emails || profile.emails.length === 0 || !profile.name) {
            return done(new Error('No email found in Google profile'));
        }
        const user = await this.authService.validateGoogleUser({
            email: profile.emails[0].value,
            fullName: profile.name.givenName + ' ' + profile.name.familyName,
        });
        console.log('Google user validated:', user);
        if (!user) {
            return done(new Error('Error validating Google user'));
        }

        done(null, user);
    }
}
