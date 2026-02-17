import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { WalletsEntity } from '../wallets/wallets.entity';
import { TransactionType, TransactionStatus } from '..//common/constants/transaction.enums';
import { CurrencyType } from '../common/constants/currency-type.enum';

@Entity('transactions')
export class TransactionsEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'enum', enum: TransactionType })
    type: TransactionType;

    @Column('uuid', {name: 'sender_wallet_id', nullable: true })

    senderWalletId: string | null;

    @ManyToOne(() => WalletsEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'sender_wallet_id' })
    senderWallet: WalletsEntity;

    @Column('uuid', {name: 'receiver_wallet_id', nullable: true })
    receiverWalletId: string | null;

    @ManyToOne(() => WalletsEntity, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'receiver_wallet_id' })
    receiverWallet: WalletsEntity;

    @Column({ name: 'amount_cents', type: 'int' })
    amountCents: number;

    @Column({ type: 'enum', enum: CurrencyType })
    currency: CurrencyType;

    @Column({ type: 'enum', enum: TransactionStatus, default: TransactionStatus.completed })
    status: TransactionStatus;

    @Column({ name: 'idempotency_key', type: 'varchar', length: 255, nullable: true, unique: true })
    idempotencyKey: string | null;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt: Date;
}
