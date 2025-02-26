import { Country } from 'src/country/entities/country.entity';
import { AppBaseEntity } from 'src/shared/typeorm/base.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('country_currencies')
export class CountryCurrency extends AppBaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', type: 'int' })
  id: number;

  @Column({ name: 'currency', type: 'varchar' })
  currency: string;

  @Column({ name: 'country_id', type: 'int' })
  countryId: number;

  @OneToOne(() => Country, (country) => country.currency)
  @JoinColumn({
    name: 'country_id',
    foreignKeyConstraintName: 'FK-countries-countries_currencies',
  })
  country: Country;
}
