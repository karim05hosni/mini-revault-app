import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { UserRole } from '../common/constants/user-role.enum';
import { WalletsEntity } from 'src/wallets/wallets.entity';

@Entity('users')
export class UsersEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'full_name', type: 'varchar', length: 150 })
  fullName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.user })
  role: UserRole;

  @Column({ name: 'is_frozen', type: 'boolean', default: false })
  isFrozen: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @OneToMany(() => WalletsEntity, wallet => wallet.user)
  wallets: WalletsEntity[];

}
