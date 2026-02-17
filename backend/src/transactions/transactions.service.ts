
import { WalletsService } from '../wallets/wallets.service';
import { TransferDto } from './dto/transfer.dto';

import { Injectable, NotFoundException, BadRequestException, ForbiddenException, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { WalletsEntity } from '../wallets/wallets.entity';
import { TransactionsEntity } from './transactions.entity';
import { TransactionType, TransactionStatus } from '../common/constants/transaction.enums';
import { CurrencyType } from '../common/constants/currency-type.enum';
import { CurrencyService } from './currency.service';
import { ExchangeDto } from './dto/exchange.dto';

@Injectable()
export class TransactionsService {
    constructor(
        private readonly dataSource: DataSource,
        @Inject(CurrencyService) private readonly currencyService: CurrencyService,
        private readonly walletsService: WalletsService,
    ) { }

    async deposit(dto: DepositDto, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Lock wallet row
            const wallet = await queryRunner.manager.findOne(WalletsEntity, {
                where: { id: dto.walletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!wallet) throw new NotFoundException('Wallet not found');
            if (wallet.userId !== userId) throw new ForbiddenException('You do not own this wallet');

            // Convert currency if needed
            let depositCents = await this.toCents(dto.amount);
            let txCurrency = dto.currency as CurrencyType;
            if (dto.currency !== wallet.currency) {
                if (dto.currency === CurrencyType.USD && wallet.currency === CurrencyType.EUR) {
                    depositCents = this.currencyService.convertUsdToEur(depositCents);
                } else if (dto.currency === CurrencyType.EUR && wallet.currency === CurrencyType.USD) {
                    depositCents = this.currencyService.convertEurToUsd(depositCents);
                } else {
                    throw new BadRequestException('Unsupported currency conversion');
                }
                txCurrency = wallet.currency;
            }

            // Update balance
            wallet.balanceCents += depositCents;
            await queryRunner.manager.save(wallet);
            // Log transaction
            const tx = queryRunner.manager.create(TransactionsEntity, {
                type: TransactionType.deposit,
                receiverWalletId: wallet.id,
                amountCents: depositCents,
                currency: txCurrency,
                status: TransactionStatus.completed,
            });
            await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();
            return { success: true, transactionId: tx.id };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async withdraw(dto: WithdrawDto, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Lock wallet row
            const wallet = await queryRunner.manager.findOne(WalletsEntity, {
                where: { id: dto.walletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!wallet) throw new NotFoundException('Wallet not found');
            if (wallet.userId !== userId) throw new ForbiddenException('You do not own this wallet');

            // Convert currency if needed
            let withdrawCents = await this.toCents(dto.amount);
            let txCurrency = dto.currency as CurrencyType;
            if (dto.currency !== wallet.currency) {
                if (dto.currency === CurrencyType.USD && wallet.currency === CurrencyType.EUR) {
                    withdrawCents = this.currencyService.convertUsdToEur(withdrawCents);
                } else if (dto.currency === CurrencyType.EUR && wallet.currency === CurrencyType.USD) {
                    withdrawCents = this.currencyService.convertEurToUsd(withdrawCents);
                } else {
                    throw new BadRequestException('Unsupported currency conversion');
                }
                txCurrency = wallet.currency;
            }

            if (wallet.balanceCents < withdrawCents) {
                throw new BadRequestException('Insufficient balance');
            }
            // Update balance
            wallet.balanceCents -= withdrawCents;
            await queryRunner.manager.save(wallet);
            // Log transaction
            const tx = queryRunner.manager.create(TransactionsEntity, {
                type: TransactionType.withdrawal,
                senderWalletId: wallet.id,
                amountCents: withdrawCents,
                currency: txCurrency,
                status: TransactionStatus.completed,
            });
            await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();
            return { success: true, transactionId: tx.id };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async transfer(dto: TransferDto, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Lock sender wallet
            const senderWallet = await queryRunner.manager.findOne(WalletsEntity, {
                where: { id: dto.senderWalletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!senderWallet) throw new NotFoundException('Sender wallet not found');
            if (senderWallet.userId !== userId) throw new ForbiddenException('You do not own this wallet');

            // Get receiver wallet by email
            const receiverWallet = await queryRunner.manager.findOne(WalletsEntity, {
                where: { user: { email: dto.receiverEmail }, currency: dto.currency as CurrencyType },
                lock: { mode: 'pessimistic_write' },
            });
            if (!receiverWallet) {
                throw new NotFoundException('Receiver wallet not found');
            }

            // Convert amount if needed
            let amountCents = await this.toCents(dto.amount);
            let deductedAmount = amountCents;
            let creditedAmount = amountCents;
            let txCurrency = senderWallet.currency;
            if (senderWallet.currency !== receiverWallet.currency) {
                if (senderWallet.currency === CurrencyType.USD && receiverWallet.currency === CurrencyType.EUR) {
                    creditedAmount = this.currencyService.convertUsdToEur(amountCents);
                } else if (senderWallet.currency === CurrencyType.EUR && receiverWallet.currency === CurrencyType.USD) {
                    creditedAmount = this.currencyService.convertEurToUsd(amountCents);
                } else {
                    throw new BadRequestException('Unsupported currency conversion');
                }
                txCurrency = receiverWallet.currency;
            }

            if (senderWallet.balanceCents < amountCents) {
                throw new BadRequestException('Insufficient balance');
            }

            // Update balances
            senderWallet.balanceCents -= deductedAmount;
            receiverWallet.balanceCents += creditedAmount;
            await queryRunner.manager.save(senderWallet);
            await queryRunner.manager.save(receiverWallet);

            // Log transaction
            const tx = queryRunner.manager.create(TransactionsEntity, {
                type: TransactionType.transfer,
                senderWalletId: senderWallet.id,
                receiverWalletId: receiverWallet.id,
                amountCents: creditedAmount,
                currency: txCurrency,
                status: TransactionStatus.completed,
            });
            await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();
            return { success: true, transactionId: tx.id };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
    async exchange(dto: ExchangeDto, userId: string) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            // Lock both wallets
            const fromWallet = await queryRunner.manager.findOne(WalletsEntity, {
                where: { id: dto.fromWalletId },
                lock: { mode: 'pessimistic_write' },
            });
            const toWallet = await queryRunner.manager.findOne(WalletsEntity, {
                where: { id: dto.toWalletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!fromWallet || !toWallet) throw new NotFoundException('Wallet not found');
            if (fromWallet.userId !== userId || toWallet.userId !== userId) throw new ForbiddenException('You do not own both wallets');

            // Convert amount if needed
            let amountCents = await this.toCents(dto.amount);
            let convertedCents = amountCents;
            if (fromWallet.currency !== toWallet.currency) {
                if (fromWallet.currency === CurrencyType.USD && toWallet.currency === CurrencyType.EUR) {
                    convertedCents = this.currencyService.convertUsdToEur(amountCents);
                } else if (fromWallet.currency === CurrencyType.EUR && toWallet.currency === CurrencyType.USD) {
                    convertedCents = this.currencyService.convertEurToUsd(amountCents);
                } else {
                    throw new BadRequestException('Unsupported currency conversion');
                }
            }

            if (fromWallet.balanceCents < amountCents) {
                throw new BadRequestException('Insufficient balance');
            }

            // Update balances
            fromWallet.balanceCents -= amountCents;
            toWallet.balanceCents += convertedCents;
            await queryRunner.manager.save(fromWallet);
            await queryRunner.manager.save(toWallet);

            // Log transaction as 'exchange'
            const tx = queryRunner.manager.create(TransactionsEntity, {
                type: TransactionType.conversion,
                senderWalletId: fromWallet.id,
                receiverWalletId: toWallet.id,
                amountCents: amountCents,
                currency: fromWallet.currency,
                status: TransactionStatus.completed,
            });
            await queryRunner.manager.save(tx);
            await queryRunner.commitTransaction();
            return { success: true, transactionId: tx.id };
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
    async toCents(amount: string): Promise<number> {
        if (!/^\d+(\.\d{1,2})?$/.test(amount)) {
            throw new Error('Invalid amount format');
        }
        const [whole, decimal = ''] = amount.split('.');
        const paddedDecimal = (decimal + '00').slice(0, 2);
        return parseInt(whole) * 100 + parseInt(paddedDecimal);
    }

    async getHistory(userId: string, type?: string) {
        const wallets = await this.walletsService.getUserWallets(userId);
        const walletIds = wallets.map(w => w.id);
        if (!walletIds.length) return [];

        const allowedTypes = ['sent', 'received', 'deposit', 'withdrawal', 'transfer', 'conversion'];
        const filterType = type && allowedTypes.includes(type) ? type : undefined;

        const qb = this.dataSource.getRepository(TransactionsEntity)
            .createQueryBuilder('tx')
            .where('tx.senderWalletId IN (:...walletIds) OR tx.receiverWalletId IN (:...walletIds)', { walletIds });
        if (filterType) {
            if (filterType === 'sent') {
                qb.andWhere('tx.type = :type AND tx.senderWalletId IN (:...walletIds)', { type: 'transfer', walletIds });
            } else if (filterType === 'received') {
                qb.andWhere('tx.type = :type AND tx.receiverWalletId IN (:...walletIds)', { type: 'transfer', walletIds });
            } else {
                qb.andWhere('tx.type = :type', { type: filterType });
            }
        }
        qb.orderBy('tx.createdAt', 'DESC');
        const transactions = await qb.getMany();
        // Map to DTO
        return transactions.map(tx => ({
            id: tx.id,
            type: tx.type,
            senderWalletId: tx.senderWalletId,
            receiverWalletId: tx.receiverWalletId,
            amountCents: tx.amountCents,
            currency: tx.currency,
            status: tx.status,
            createdAt: tx.createdAt,
        }));
    }

}
