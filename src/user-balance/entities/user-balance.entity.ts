import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';

import { SnowflakeIdColumn } from '../../shared/decorators/snowflake-id.decorator';
import { AppBaseEntity } from '../../shared/typeorm/base.entity';

@Entity('user_balances')
export class UserBalance extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'decimal', precision: 36, scale: 8, default: '0' })
  amount: string;

  @Column({
    name: 'locked_amount',
    type: 'decimal',
    precision: 36,
    scale: 8,
    default: '0',
  })
  lockedAmount: string;

  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @OneToOne(() => User)
  user: User;
}
