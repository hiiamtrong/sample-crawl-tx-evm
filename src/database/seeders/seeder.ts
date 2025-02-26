import { Injectable } from '@nestjs/common';
import { AssetTokenSeeder } from 'src/database/seeders/asset-token.seeder';
import { CardSeeder } from 'src/database/seeders/card.seeder';
import { CountrySeeder } from 'src/database/seeders/country.seeder';

import { SystemConfigSeeder } from './system-config.seeder';

@Injectable()
export class Seeder {
  constructor(
    private readonly systemConfigSeeder: SystemConfigSeeder,
    private readonly cardSeeder: CardSeeder,
    private readonly assetTokenSeeder: AssetTokenSeeder,
    private readonly countrySeeder: CountrySeeder,
  ) {}

  async seed() {
    try {
      await this.systemConfigSeeder.seed();
      await this.cardSeeder.seed();
      await this.assetTokenSeeder.seed();
      await this.countrySeeder.seed();
    } catch (error) {
      console.error(error);
    }

    // Call other seeders here
  }
}
