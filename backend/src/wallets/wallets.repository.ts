import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { WalletsEntity } from './wallets.entity';
import { CurrencyType } from '../common/constants/currency-type.enum';

@Injectable()
export class WalletsRepository {
	private repo: Repository<WalletsEntity>;

	constructor(private readonly dataSource: DataSource) {
		this.repo = this.dataSource.getRepository(WalletsEntity);
	}

	async createWallet(userId: string, currency: CurrencyType, balanceCents: number): Promise<WalletsEntity> {
		const wallet = this.repo.create({ userId, currency, balanceCents });
		return this.repo.save(wallet);
	}
}
