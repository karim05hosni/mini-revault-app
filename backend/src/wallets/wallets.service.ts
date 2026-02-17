
import { Injectable } from '@nestjs/common';
import { WalletsRepository } from './wallets.repository';
import { CurrencyType } from '../common/constants/currency-type.enum';

import { UsersEntity } from '../auth/users.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletsEntity } from './wallets.entity';

@Injectable()
export class WalletsService {
    constructor(
        private readonly walletsRepository: WalletsRepository,
        @InjectRepository(WalletsEntity) private readonly walletsRepo: Repository<WalletsEntity>,
    ) { }

    async createWallet(userId: string, currency: CurrencyType, balanceCents: number) {
        return this.walletsRepository.createWallet(userId, currency, balanceCents);
    }
    async findById(walletId: string) {
        return this.walletsRepo.findOne({ where: { id: walletId } });
    }
    async getUserWallets(userId: string) {
        return this.walletsRepo.find({ where: { userId } });
    }

}
