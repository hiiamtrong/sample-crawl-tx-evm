import { User } from 'src/user/entities/user.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

import { SnowflakeIdColumn } from '../../shared/decorators/snowflake-id.decorator';
import { AppBaseEntity } from '../../shared/typeorm/base.entity';

@Entity('rewards')
export class Reward extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ type: 'decimal', precision: 36, scale: 8, default: '0' })
  amount: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
