import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fireblocks_vaults')
export class FireblocksVault extends AppBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ name: 'user_id', type: 'bigint' })
  userId: string;
}
