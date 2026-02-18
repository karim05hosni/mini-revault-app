import { Injectable, ConflictException, UnauthorizedException, Inject, forwardRef, BadRequestException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { AuthRepository } from './auth.repository';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { WalletsService } from '../wallets/wallets.service';
import { CurrencyType } from '../common/constants/currency-type.enum';

@Injectable()
export class AuthService {
	constructor(
		private readonly authRepository: AuthRepository,
		private readonly jwtService: JwtService,
		@Inject(forwardRef(() => WalletsService))
		private readonly walletsService: WalletsService,
	) { }

	async register(dto: RegisterUserDto, isGoogleUser = false) {
		const existing = await this.authRepository.findByEmail(dto.email);
		if (existing) {
			throw new ConflictException('Email already in use');
		}
		let user;
		if (!isGoogleUser) {
			// validate password length for non-Google users
			if (dto.password.length < 6) {
				throw new BadRequestException('Password must be at least 6 characters long');
			}
			const passwordHash = await bcrypt.hash(dto.password, 10);
			user = await this.authRepository.createUser({
				fullName: dto.fullName,
				email: dto.email,
				passwordHash,
			});
		} else {
			user = await this.authRepository.createGoogleUser({
				email: dto.email,
				fullName: dto.fullName,
			});
		}

		// Create USD and EUR wallets with 1000 units each
		const usdWallet = await this.walletsService.createWallet(user.id, CurrencyType.USD, 100000); // 1000 USD in cents
		const eurWallet = await this.walletsService.createWallet(user.id, CurrencyType.EUR, 100000); // 1000 EUR in cents
		console.log(`Created wallets for user ${user.id}: USD wallet ${usdWallet.id}, EUR wallet ${eurWallet.id}`);
		return {
			id: user.id,
			email: user.email,
			fullName: user.fullName,
			wallets: [
				{ id: usdWallet.id, currency: usdWallet.currency, balanceCents: usdWallet.balanceCents },
				{ id: eurWallet.id, currency: eurWallet.currency, balanceCents: eurWallet.balanceCents },
			],
		};
	}

	async login(dto: LoginUserDto) {
		const user = await this.authRepository.findByEmail(dto.email);
		if (!user) {
			throw new UnauthorizedException('Invalid credentials');
		}
		if (user.provider !== 'google'){
			const valid = await bcrypt.compare(dto.password, user.passwordHash);
			if (!valid) {
				throw new UnauthorizedException('Invalid credentials');
			}
		}
		const payload = { sub: user.id, email: user.email, role: user.role };
		const token = await this.jwtService.signAsync(payload);
		return {
			access_token: token,
			user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role },
		};
	}
	async validateGoogleUser(data: { email: string; fullName: string }) {
		let user = await this.authRepository.findByEmail(data.email);

		if (!user) {
			await this.register({ email: data.email, fullName: data.fullName, password: '' }, true);
			user = await this.authRepository.findByEmail(data.email);
		}

		return user;
	}
}
