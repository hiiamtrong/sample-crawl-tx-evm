import { NetworkEnum, NetworkTypeEnum } from 'src/network/network.constant';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { AssetTransaction } from 'src/transaction/entities/asset-transaction.entity';
import { UserWallet } from 'src/user-wallet/entities/user-wallet.entity';
import { Column, Entity, OneToMany } from 'typeorm';

export enum CurrencyEnum {
  USDT = 'USDT',
  USDC = 'USDC',
  ETH = 'ETH',
}


@Entity('asset_tokens')
export class AssetToken extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'varchar', length: '50' })
  symbol: string;

  @Column({ type: 'varchar', length: '50' })
  name: string;

  @Column({ type: 'varchar', length: '50' })
  network: NetworkEnum;

  @Column({
    type: 'varchar',
    length: '50',
    name: 'network_type',
    default: NetworkTypeEnum.EVM,
  })
  networkType: NetworkTypeEnum;

  @Column({ type: 'varchar', length: '50' })
  currency: CurrencyEnum;

  @Column({ type: 'varchar', length: '50' })
  coingeckoId: string;

  @Column({
    type: 'varchar',
    length: '50',
    nullable: true,
    name: 'native_token_coingecko_id',
  })
  nativeTokenCoingeckoId: string;

  @Column({ type: 'varchar', name: 'contract_address' })
  contractAddress: string;

  @Column({ type: 'varchar', length: '50', name: 'chain_id' })
  chainId: string;

  @Column({ type: 'boolean', default: false, name: 'is_native' })
  isNative: boolean;

  @Column({ type: 'int', default: 18, name: 'decimals' })
  decimals: number;

  @Column({ type: 'int', default: 18, name: 'fee_decimals' })
  feeDecimals: number;

  @OneToMany(
    () => AssetTransaction,
    (assetTransaction) => assetTransaction.assetToken,
  )
  assetTransactions: AssetTransaction[];

  @OneToMany(() => UserWallet, (userWallet) => userWallet.assetToken)
  userWallets: UserWallet[];
}
