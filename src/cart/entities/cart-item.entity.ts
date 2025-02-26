import { Card } from 'src/card/entities/card.entity';
import { SnowflakeIdColumn } from 'src/shared/decorators/snowflake-id.decorator';
import {
  BaseEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';

import { Cart } from './cart.entity';

@Entity('cart_items')
export class CartItem extends BaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'bigint', name: 'cart_id' })
  cartId: string;

  @Column({ type: 'bigint', name: 'card_id' })
  cardId: string;

  @Column({ type: 'int', name: 'amount', default: 1 })
  amount: number;

  @JoinColumn({
    name: 'cart_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-carts-cart_items',
  })
  @ManyToOne(() => Cart, (cart) => cart.items)
  cart: Cart;

  @JoinColumn({
    name: 'card_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-cards-cart_items',
  })
  @ManyToOne(() => Card, (card) => card.cartItems)
  card: Card;
} 
