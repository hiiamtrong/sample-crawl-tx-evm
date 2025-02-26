import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Country } from 'src/country/entities/country.entity';
import { CountryCurrency } from 'src/country/entities/country-currency.entity';

import { BackofficeCountriesController } from './controllers/backoffice-countries.controller';
import { CountriesController } from './controllers/countries.controller';
import { BackofficeCountriesService } from './services/backoffice-countries.service';
import { CountriesService } from './services/countries.service';

@Module({
  imports: [TypeOrmModule.forFeature([Country, CountryCurrency])],
  controllers: [CountriesController, BackofficeCountriesController],
  providers: [CountriesService, BackofficeCountriesService],
  exports: [CountriesService, BackofficeCountriesService],
})
export class CountriesModule {}
