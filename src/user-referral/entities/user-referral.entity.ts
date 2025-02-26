import { SnowflakeIdColumn } from "src/shared/decorators/snowflake-id.decorator";
import { AppBaseEntity } from "src/shared/typeorm/base.entity";
import { User } from "src/user/entities/user.entity";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";

@Entity({ name: 'user_referral' })
export class UserReferral extends AppBaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'varchar', name: 'user_id', unique: true })
  userId: string;

  @Column({ type: 'varchar', name: 'referred_by' })
  referredBy: string;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'referred_by' })
  referredByUser: User;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'numeric', name: 'reward_amount', default: 0 })
  rewardAmount: string;
}
