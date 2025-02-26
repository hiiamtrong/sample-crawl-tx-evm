import {
  CardUser,
  ECardPriceCurrency,
} from 'src/card/entities/card-user.entity';
import { CartItem } from 'src/cart/entities/cart-item.entity';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import { Column, Entity, JoinColumn, OneToMany } from 'typeorm';

export enum ECardType {
  PLASTIC = 'PLASTIC',
  METAL = 'METAL',
}

export interface ICardPrice {
  currency: ECardPriceCurrency;
  amount: number;
}

@Entity('cards')
export class Card {
  @SnowflakeIdColumn()
  id: string;

  @Column({
    type: 'enum',
    enum: ECardType,
  })
  type: ECardType;

  @Column({
    type: 'varchar',
    name: 'sub_type',
  })
  subType: string;

  @Column({ type: 'varchar', name: 'name' })
  name: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', default: [] })
  price: ICardPrice[];

  @Column({ type: 'int', default: 5, name: 'max_owned' })
  maxOwned: number;

  @Column({ type: 'int', name: 'earning_token', default: 0 })
  earningToken: number;

  @Column({ type: 'decimal', name: 'next_card_discount_percent', default: 0 })
  nextCardDiscountPercent: number;

  @JoinColumn({ name: 'card_id', referencedColumnName: 'id' })
  @OneToMany(() => CardUser, (cardUser) => cardUser.card)
  cardUsers: CardUser[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.card)
  cartItems: CartItem[];
}
