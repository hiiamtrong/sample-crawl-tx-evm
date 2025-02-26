import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetToken } from 'src/asset-token/entities/asset-token.entity';
import { Card } from 'src/card/entities/card.entity';
import { Country } from 'src/country/entities/country.entity';
import { CountryCurrency } from 'src/country/entities/country-currency.entity';
import { AssetTokenSeeder } from 'src/database/seeders/asset-token.seeder';
import { CardSeeder } from 'src/database/seeders/card.seeder';
import { CountrySeeder } from 'src/database/seeders/country.seeder';
import { SharedModule } from 'src/shared/shared.module';

import { SystemConfig } from '../../system-config/entities/system-config.entity';
import { SeedCommand } from './seed.command';
import { Seeder } from './seeder';
import { SystemConfigSeeder } from './system-config.seeder';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      SystemConfig,
      Card,
      AssetToken,
      Country,
      CountryCurrency,
    ]),
  ],
  providers: [

    Seeder,
    SeedCommand,
    SystemConfigSeeder,
    CardSeeder,
    AssetTokenSeeder,
    CountrySeeder,

  ],
})
export class SeederModule { }
