import { CardOrder } from 'src/card/entities/card-order.entity';
import { CardUser } from 'src/card/entities/card-user.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { Country } from 'src/country/entities/country.entity';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import { AssetTransaction } from 'src/transaction/entities/asset-transaction.entity';
import { UserWallet } from 'src/user-wallet/entities/user-wallet.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  UpdateDateColumn
} from 'typeorm';

export enum AuthProvider {
  BASIC = 'basic',
  GOOGLE = 'google',
  WEB3 = 'web3',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('users')
export class User {
  @SnowflakeIdColumn()
  id: string;

  @Column({ length: 200, nullable: true, unique: true })
  email?: string;

  @Column({ length: 200, nullable: true, unique: true })
  alias?: string;

  @Column({ type: 'boolean', name: 'is_hidden', default: true })
  isHidden: boolean;

  @Column({ length: 200, nullable: true, name: 'temp_email' })
  tempEmail?: string;

  @Column({ length: 200, nullable: true, unique: true })
  address?: string;

  @Column({ length: 200 })
  password: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.PENDING })
  status: UserStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'int', name: 'country_id', nullable: true })
  countryId: number;

  @Column({ type: 'varchar', name: 'referral_code', nullable: true })
  referralCode: string;

  @Column({ type: 'boolean', name: 'first_login', default: true })
  firstLogin: boolean;

  @Column({ type: 'enum', enum: AuthProvider, name: 'auth_provider', default: AuthProvider.BASIC })
  authProvider: AuthProvider;

  @Column({ name: 'updated_by', nullable: true })
  updatedBy: string;

  @Column('boolean', { name: 'is_deleted', default: false })
  isDeleted: boolean;

  @Column('boolean', { name: 'disabled_redeem', default: false })
  disabledRedeem: boolean;

  @Column('boolean', { name: 'disabled_purchase', default: false })
  disabledPurchase: boolean;

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy: string;

  @CreateDateColumn({ name: 'created_at', nullable: true })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', nullable: true })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt: Date;



  @OneToMany(
    () => AssetTransaction,
    (assetTransaction) => assetTransaction.user,
  )
  assetTransactions: AssetTransaction[];

  @OneToMany(() => UserWallet, (userWallet) => userWallet.user)
  wallets: UserWallet[];

  @OneToMany(() => CardUser, (cardUser) => cardUser.user)
  cardUsers: CardUser[];

  @OneToMany(() => CardOrder, (cardOrder) => cardOrder.user)
  cardOrders: CardOrder[];

  @ManyToOne(() => Country, (country) => country.users)
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;
}
