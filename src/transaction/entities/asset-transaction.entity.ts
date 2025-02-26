import { AssetToken } from 'src/asset-token/entities/asset-token.entity';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne, ObjectLiteral } from 'typeorm';

export enum AssetTransactionTypeEnum {
  deposit = 'deposit',
  withdraw = 'withdraw',
  sweep = 'sweep',
  sendFee = 'send_fee',
}

export enum AssetTransactionStatusEnum {
  pending = 'Pending',
  completed = 'Completed',
  failed = 'Failed',
  notQualified = 'Not_Qualified',
}

@Entity('asset_transactions')
export class AssetTransaction extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'enum', enum: AssetTransactionTypeEnum })
  type: AssetTransactionTypeEnum;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({
    type: 'enum',
    enum: AssetTransactionStatusEnum,
    default: AssetTransactionStatusEnum.pending,
  })
  status: AssetTransactionStatusEnum;

  @Column({ name: 'asset_token_id', type: 'bigint' })
  assetTokenId: string;

  @Column({ type: 'varchar', length: '100', nullable: true })
  tx?: string;

  @Column({ type: 'varchar', length: '100' })
  amount: string;

  @Column({
    name: 'final_amount',
    type: 'varchar',
    length: '100',
    nullable: true,
  })
  finalAmount: string;

  @Column({ name: 'network_fee_amount', type: 'varchar', default: '0' })
  networkFeeAmount: string;

  @Column({
    name: 'network_fee_usd_amount',
    type: 'varchar',
    default: '0',
  })
  networkFeeUsdAmount: string;

  @Column({
    name: 'usd_amount',
    type: 'numeric',
    precision: 36,
    scale: 8,
    nullable: true,
  })
  usdAmount: string;

  @Column({
    name: 'final_usd_amount',
    type: 'numeric',
    precision: 36,
    scale: 8,
    nullable: true,
  })
  finalUsdAmount: string;

  @Column({ type: 'varchar', length: '100', default: '0' })
  referralRewardAmount: string;

  @Column({ type: 'varchar', length: '100', nullable: true })
  from?: string;

  @Column({ type: 'varchar', length: '100', nullable: true })
  to?: string;

  @Column({ type: 'json', nullable: true })
  params?: ObjectLiteral;

  @Column({ type: 'text', nullable: true, name: 'failed_reason' })
  failedReason?: string;

  @ManyToOne(() => User, (user) => user.assetTransactions)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'PK-users-asset_transactions',
  })
  user: User;

  @ManyToOne(() => AssetToken, (assetToken) => assetToken.assetTransactions)
  @JoinColumn({
    name: 'asset_token_id',
    foreignKeyConstraintName: 'PK-asset_tokens-asset_transactions',
  })
  assetToken: AssetToken;
}
