import { Controller, Post, Body, BadRequestException, Get, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';

import { LoginUserDto } from './dto/login-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { GoogleOauthGuard } from 'src/common/guards/OAuth-guard';

@Controller('api/auth')
export class AuthController {
	constructor(private readonly authService: AuthService) { }

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
	async googleAuthRedirect(@Req() req) {
		return this.authService.login(req.user);
	}
}
