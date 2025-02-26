import {
  CardUser,
  ECardPriceCurrency,
} from 'src/card/entities/card-user.entity';
import { Country } from 'src/country/entities/country.entity';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';

export enum ECardOrderStatus {
  REFUNDED = 'refunded',
  COMPLETED = 'completed',
}

@Entity('card_orders')
export class CardOrder extends BaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @Column({ type: 'enum', name: 'status', enum: ECardOrderStatus, default: ECardOrderStatus.COMPLETED })
  status: ECardOrderStatus;

  @Column({ type: 'decimal', name: 'total_price' })
  totalPrice: string;

  @Column({ type: 'decimal', name: 'total_discount_amount', default: '0' })
  totalDiscountAmount: string;

  @Column({ type: 'decimal', name: 'reward_amount', default: '0' })
  rewardAmount: string;

  @Column({ type: 'varchar', name: 'card_price_currency' })
  cardPriceCurrency: ECardPriceCurrency;

  @Column({ type: 'timestamp', name: 'purchase_date' })
  purchaseDate: Date;

  @Column({ type: 'int', name: 'country_id' })
  countryId: number;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-users-card_orders',
  })
  @ManyToOne(() => User, (user) => user.cardOrders)
  user: User;

  @OneToMany(() => CardUser, (cardUser) => cardUser.cardOrder)
  cardUsers: CardUser[];

  @JoinColumn({
    name: 'country_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-countries-card_orders',
  })
  @ManyToOne(() => Country, (country) => country.cardOrders)
  country: Country;
}
