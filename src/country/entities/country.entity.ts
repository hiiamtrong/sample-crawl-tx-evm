import { CardOrder } from 'src/card/entities/card-order.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CountryCurrency } from 'src/country/entities/country-currency.entity';
import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import { User } from 'src/user/entities/user.entity';
import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';

@Entity('countries')
export class Country extends AppBaseEntity {
  @PrimaryColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'name', type: 'varchar', length: '100' })
  name: string;

  @Column({ name: 'iso2', type: 'varchar', length: '2' })
  iso2: string;

  @Column({ name: 'iso3', type: 'varchar', length: '3' })
  iso3: string;

  @Column({ name: 'numeric_code', type: 'int' })
  numericCode: number;

  @Column({ name: 'blacklisted', type: 'boolean', default: false })
  blacklisted: boolean;

  // references
  @OneToOne(() => CountryCurrency, (currency) => currency.country)
  currency: CountryCurrency;

  @OneToMany(() => CardOrder, (cardOrder) => cardOrder.country)
  cardOrders: CardOrder[];

  @OneToMany(() => User, (user) => user.country)
  users: User[];

  @OneToMany(() => Cart, (cart) => cart.country)
  carts: Cart[];
}
