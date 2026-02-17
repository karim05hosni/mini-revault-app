import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { UsersEntity } from '..//auth/users.entity';
import { CurrencyType } from '..//common/constants/currency-type.enum';

@Entity('wallets')
export class WalletsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { name: 'user_id' })
  userId: string;

  @ManyToOne(() => UsersEntity, user => user.wallets, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: UsersEntity;

  @Column({ type: 'enum', enum: CurrencyType })
  currency: CurrencyType;

  @Column({ name: 'balance_cents', type: 'int', default: 0 })
  balanceCents: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;
}
