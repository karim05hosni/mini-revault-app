
import { Controller, Get, Param, Req, UseGuards, NotFoundException, ForbiddenException } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { JwtAuthGuard } from '../common/guards/jwt-guard';
import { ApiBearerAuth } from '@nestjs/swagger';


@ApiBearerAuth('bearer')
@Controller('api/wallets')
export class WalletsController {
	constructor(private readonly walletsService: WalletsService) {}

	@UseGuards(JwtAuthGuard)
	@Get(':walletId/balance')
	async getWalletBalance(@Param('walletId') walletId: string, @Req() req) {
		const wallet = await this.walletsService.findById(walletId);
		if (!wallet) throw new NotFoundException('Wallet not found');
		if (wallet.userId !== req.user.sub) throw new ForbiddenException('You do not own this wallet');
		return { balanceCents: wallet.balanceCents, currency: wallet.currency };
	}
	@UseGuards(JwtAuthGuard)
	@Get('user')
	async getUserWallets(@Req() req) {
		return this.walletsService.getUserWallets(req.user.userId);
	}
}
