import { AssetToken,  } from 'src/asset-token/entities/asset-token.entity';
import { NetworkTypeEnum } from 'src/network/network.constant';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';


export enum UserWalletType {
  EVM = 'evm',
}

@Index('user_fireblocks_asset_idx', ['userId', 'assetTokenId'], {
  unique: true,
})
@Entity('user_wallets')
export class UserWallet extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ type: 'bigint', name: 'asset_token_id' })
  assetTokenId: string;

  @Column({ type: 'varchar', length: '50', name: 'network_type', default: NetworkTypeEnum.EVM })
  networkType: NetworkTypeEnum;

  @Column({ type: 'varchar', length: '255' })
  address: string;

  @Column({ type: 'text', name: 'private_key' })
  privateKey: string;

  // references

  @ManyToOne(() => User, (user) => user.wallets)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK-users-user_wallets',
  })
  user: User;

  @ManyToOne(() => AssetToken, (assetToken) => assetToken.userWallets)
  @JoinColumn({
    name: 'asset_token_id',
    foreignKeyConstraintName: 'FK-asset_tokens-user_wallets',
  })
  assetToken: AssetToken;
}
