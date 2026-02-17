import { Module } from '@nestjs/common';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';
import { TransactionsRepository } from './transactions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsEntity } from './transactions.entity';
import { CurrencyService } from './currency.service';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [
      TypeOrmModule.forFeature([TransactionsEntity]),
      WalletsModule
    ],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, CurrencyService],
})
export class TransactionsModule {}
