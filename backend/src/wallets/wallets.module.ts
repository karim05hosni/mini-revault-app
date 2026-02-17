import { Module } from '@nestjs/common';
import { WalletsController } from './wallets.controller';
import { WalletsService } from './wallets.service';
import { WalletsRepository } from './wallets.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletsEntity } from './wallets.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([WalletsEntity]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService, WalletsRepository],
  exports: [WalletsService],
})
export class WalletsModule {}
