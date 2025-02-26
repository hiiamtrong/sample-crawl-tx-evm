import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fireblocks_internal_assets')
export class FireblocksInternalAsset extends AppBaseEntity {
  @PrimaryColumn({
    name: 'fireblocks_internal_wallet_id',
    type: 'varchar',
    length: '100',
  })
  internalWalletId: string;

  @PrimaryColumn({
    name: 'fireblocks_asset_id',
    type: 'varchar',
    length: '100',
  })
  assetId: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;

  @Column({ name: 'address', type: 'varchar', length: '100' })
  address: string;
}
