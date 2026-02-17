
import { Controller, Post, Body, BadRequestException, UseGuards, Req, Query, Get } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { DepositDto } from './dto/deposit.dto';
import { WithdrawDto } from './dto/withdraw.dto';
import { TransferDto } from './dto/transfer.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-guard';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExchangeDto } from './dto/exchange.dto';


@ApiBearerAuth('bearer')
@Controller('api/transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @UseGuards(JwtAuthGuard)
    @Post('deposit')
    async deposit(@Body() dto: DepositDto, @Req() req) {
        try {
            return await this.transactionsService.deposit(dto, req.user.userId);
        } catch (err) {
            throw new BadRequestException(err);
        }


    }

    @UseGuards(JwtAuthGuard)
    @Post('withdraw')
    async withdraw(@Body() dto: WithdrawDto, @Req() req) {
        try {
            return await this.transactionsService.withdraw(dto, req.user.userId);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }

    @UseGuards(JwtAuthGuard)
    @Post('transfer')
    async transfer(@Body() dto: TransferDto, @Req() req) {
        try {
            console.log(`Initiating transfer from user ${req.user.userId} to ${dto.receiverEmail} amount ${dto.amount} ${dto.currency}`);
            console.log('dto:', dto);
            return await this.transactionsService.transfer(dto, req.user.userId);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
    @UseGuards(JwtAuthGuard)
    @Get('history')
    async getHistory(@Req() req, @Query('type') type?: string) {
        try {
            return await this.transactionsService.getHistory(req.user.userId, type);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
    @UseGuards(JwtAuthGuard)
    @Post('exchange')
    async exchange(@Body() dto: ExchangeDto, @Req() req) {
        try {
            return await this.transactionsService.exchange(dto, req.user.userId);
        } catch (err) {
            throw new BadRequestException(err);
        }
    }
}
