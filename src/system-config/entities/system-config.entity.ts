import { Column, Entity } from 'typeorm';

import { SnowflakeIdColumn } from '../../shared/decorators/snowflake-id.decorator';
import { AppBaseEntity } from '../../shared/typeorm/base.entity';

export enum SystemConfigKey {
  FUND_HOLDER_ACCOUNT = 'FUND_HOLDER_ACCOUNT',
  WITHDRAWAL_GAS_FEE_PERCENTAGE = 'WITHDRAWAL_GAS_FEE_PERCENTAGE',
  REFERRAL_REWARD_PERCENTAGE = 'REFERRAL_REWARD_PERCENTAGE',
  MIN_SWEEP_AMOUNT_USD = 'MIN_SWEEP_AMOUNT_USD',
  MIN_DEPOSIT_AMOUNT_USD = 'MIN_DEPOSIT_AMOUNT_USD',
  MIN_WITHDRAWAL_AMOUNT_USD = 'MIN_WITHDRAWAL_AMOUNT_USD',
}

@Entity('system_configs')
export class SystemConfig extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ unique: true, type: 'varchar' })
  key: string;

  @Column({ type: 'jsonb' })
  value: Record<string, any>;

  @Column({ nullable: true })
  description: string;
}
