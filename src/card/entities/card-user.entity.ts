import { Card } from 'src/card/entities/card.entity';
import { CardOrder } from 'src/card/entities/card-order.entity';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import { User } from 'src/user/entities/user.entity';
import {
  BaseEntity,
  BeforeInsert,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

export enum ECardPriceCurrency {
  USD = 'USD',
}

export enum ECardUserStatus {
  AVAILABLE = 'available',
  REDEEMED = 'redeemed',
  REFUNDED = 'refunded',
}

@Entity('card_users')
export class CardUser extends BaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'bigint', name: 'card_order_id' })
  cardOrderId: string;

  @Column({ type: 'bigint', name: 'card_id' })
  cardId: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @Column({ type: 'integer', name: 'card_order_number' })
  cardOrderNumber: number;

  @Column({ type: 'varchar', name: 'card_price_currency' })
  cardPriceCurrency: ECardPriceCurrency;

  @Column({
    type: 'enum',
    enum: ECardUserStatus,
    name: 'status',
    default: ECardUserStatus.AVAILABLE,
  })
  status: ECardUserStatus;

  @Column({ type: 'decimal', name: 'purchase_price' })
  purchasePrice: string;

  @Column({ type: 'timestamp', name: 'purchase_date' })
  purchaseDate: Date;

  @Column({ type: 'decimal', name: 'discount_percent', default: '0' })
  discountPercent: string;

  @JoinColumn({
    name: 'card_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-cards-card_users',
  })
  @ManyToOne(() => Card, (card) => card.cardUsers)
  card: Card;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-users-card_users',
  })
  @ManyToOne(() => User, (user) => user.cardUsers)
  user: User;

  @JoinColumn({
    name: 'card_order_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-card_orders-card_users',
  })
  @ManyToOne(() => CardOrder, (cardOrder) => cardOrder.cardUsers)
  cardOrder: CardOrder;

  @Column({ type: 'timestamp', name: 'redeemed_date', nullable: true })
  redeemedDate: Date;

  @Column({ type: 'varchar', name: 'redeem_code', nullable: true })
  redeemCode: string;

  @Column({ type: 'decimal', name: 'reward_amount', default: '0' })
  rewardAmount: string;

  @BeforeInsert()
  async beforeInsert() {
    this.redeemCode = this.generateRedeemCode();
  }

  private generateRedeemCode(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
