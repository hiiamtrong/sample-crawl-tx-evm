import { Column, Entity } from 'typeorm';

import { SnowflakeIdColumn } from '../../shared/decorators/snowflake-id.decorator';
import { AppBaseEntity } from '../../shared/typeorm/base.entity';

@Entity('faqs')
export class FAQ extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'text' })
  question: string;

  @Column({ type: 'text' })
  answer: string;
}
