import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fireblocks_internal_wallets')
export class FireblocksInternalWallet extends AppBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;
}
