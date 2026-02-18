import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './auth/jwt-strategy';
import { ThrottlerModule } from '@nestjs/throttler';
import { GoogleStrategy } from './auth/google-strategy';

@Module({
  imports: [
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes ConfigModule available globally
      envFilePath: '.env', // Specifies the path to the .env file
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ]
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        schema: 'public',
        autoLoadEntities: true,   // 🔥 loads entities from all imported modules
        url: config.get<string>('DATABASE_URL'),
      }),
    
    }),
    AuthModule,
    WalletsModule,
    AnalyticsModule,
    TransactionsModule
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
