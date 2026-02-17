import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class TransferDto {
    @ApiProperty()
    @IsUUID()
    senderWalletId: string;

    @ApiProperty()
    @IsEmail()
    receiverEmail: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    amount: string;

    @ApiProperty()
    @IsString()
    currency: string;
}
