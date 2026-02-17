import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, IsNotEmpty } from 'class-validator';

export class ExchangeDto {
  @ApiProperty()
  @IsUUID()
  fromWalletId: string;

  @ApiProperty()
  @IsUUID()
  toWalletId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  amount: string;

}
