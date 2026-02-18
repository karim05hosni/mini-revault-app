import { Controller, Post, Body, BadRequestException, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOauthGuard } from 'src/common/guards/OAuth-guard';
import { ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard';

@Controller('api/auth')
export class AuthController {
	constructor(private readonly authService: AuthService, private readonly configService: ConfigService) { }

	@Post('register')
	async register(@Body() dto: RegisterUserDto) {
		try {
			return await this.authService.register(dto);
		} catch (err) {
			throw new BadRequestException(err);
		}
	}

	@Post('login')
	async login(@Body() dto: LoginUserDto) {
		try {
			return await this.authService.login(dto);
		} catch (err) {
			throw new BadRequestException(err);
		}
	}
	@Get('google')
	@UseGuards(GoogleOauthGuard)
	async googleAuth() { }

	@Get('google/callback')
	@UseGuards(GoogleOauthGuard)
	async googleAuthRedirect(@Req() req, @Res() res) {
		const user = await this.authService.login(req.user);
		const frontendUrl = this.configService.getOrThrow<string>('FRONTEND_URL');
		const encodedUser = encodeURIComponent(JSON.stringify(user.user));
		return res.redirect(
			`${frontendUrl}/login?access_token=${user.access_token}&user=${encodedUser}`
		);
	}

	@Get('profile')
	@UseGuards(JwtAuthGuard)
	async profile(@Req() req) {
		return req.user;
	}
}
