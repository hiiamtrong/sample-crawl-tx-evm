import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('fireblocks_webhook_transactions')
export class FireblocksWebhookTransaction extends AppBaseEntity {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn({ name: 'type' })
  type: string;

  @Column({ name: 'timestamp', type: 'bigint' })
  timestamp: number;

  @Column({ name: 'tenant_id' })
  tenantId: string;

  @Column({ name: 'data', type: 'json' })
  data: Record<string, any>;
}
