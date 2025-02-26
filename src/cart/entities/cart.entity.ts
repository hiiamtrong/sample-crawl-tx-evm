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
  OneToOne,
} from 'typeorm';

import { CartItem } from './cart-item.entity';

@Entity('carts')
export class Cart extends BaseEntity {
  @SnowflakeIdColumn()
  id: string;

  @Column({ type: 'bigint', name: 'user_id' })
  userId: string;

  @Column({ type: 'int', name: 'country_id', nullable: true })
  countryId: number;

  @Column({ type: 'timestamp', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @JoinColumn({
    name: 'user_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-users-carts',
  })
  @OneToOne(() => User, (user) => user.cart)
  user: User;

  @OneToMany(() => CartItem, (cartItem) => cartItem.cart)
  items: CartItem[];

  @JoinColumn({
    name: 'country_id',
    referencedColumnName: 'id',
    foreignKeyConstraintName: 'FK-countries-carts',
  })
  @ManyToOne(() => Country, (country) => country.carts)
  country: Country;
} 
