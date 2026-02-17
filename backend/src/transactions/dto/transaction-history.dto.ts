import { ApiProperty } from '@nestjs/swagger';
import { TransactionType, TransactionStatus } from '../../common/constants/transaction.enums';

export class TransactionHistoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: TransactionType;

  @ApiProperty()
  senderWalletId?: string;

  @ApiProperty()
  receiverWalletId?: string;

  @ApiProperty()
  amountCents: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  status: TransactionStatus;

  @ApiProperty()
  createdAt: Date;
}
