import { Injectable } from "@nestjs/common";

@Injectable()
export class CurrencyService {
    private readonly EUR_TO_USD = 11000;
    private readonly SCALE = 10000;

    convertEurToUsd(eurCents: number): number {
        return Math.floor((eurCents * this.EUR_TO_USD) / this.SCALE);
    }

    convertUsdToEur(usdCents: number): number {
        return Math.floor((usdCents * this.SCALE) / this.EUR_TO_USD);
    }
}