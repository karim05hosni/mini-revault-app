import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsInt, Min, IsString } from 'class-validator';

export class DepositDto {
    @ApiProperty()
    @IsUUID()
    walletId: string;

    @ApiProperty()
    @IsInt()
    @Min(1)
    amount: string;

    @ApiProperty()
    @IsString()
    currency: string;
}
