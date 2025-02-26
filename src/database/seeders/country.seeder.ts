import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as csv from 'fast-csv';
import * as fs from 'fs';
import { Country } from 'src/country/entities/country.entity';
import { CountryCurrency } from 'src/country/entities/country-currency.entity';
import { Repository } from 'typeorm';

interface CountryCsvRow {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numeric_code: number;
  currency: string;
}

interface ICountryEntity {
  id: number;
  name: string;
  iso2: string;
  iso3: string;
  numericCode: number;
}

interface ICountryCurrencyEntity {
  currency: string;
  country: {
    id: number;
  };
}

interface IReadCsvData {
  country: ICountryEntity;
  currency: ICountryCurrencyEntity;
}

@Injectable()
export class CountrySeeder {
  constructor(
    @InjectRepository(Country)
    private readonly countryRepo: Repository<Country>,
    @InjectRepository(CountryCurrency)
    private readonly countryCurrencyRepo: Repository<CountryCurrency>,
  ) {}

  async seed(): Promise<void> {
    const countriesSourceCsvPath =
      'src/database/seeders/data-seed/countries.csv';
    await this.countryRepo.manager.transaction(async (manager) => {
      await manager.query(`TRUNCATE TABLE countries RESTART IDENTITY CASCADE`);
      const data = await this.readCsv(countriesSourceCsvPath);

      await Promise.all(
        data.countriesData.map(async (country) => {
          const existingCountry = await manager.findOne(Country, {
            where: { iso2: country.iso2 },
          });
          if (existingCountry) {
            return;
          }
          return manager.save(country);
        }),
      );

      await Promise.all(
        data.countryCurrenciesData.map(async (currency) => {
          const existingCurrency = await manager.findOne(CountryCurrency, {
            where: {
              currency: currency.currency,
              country: { id: currency.country.id },
            },
          });
          if (existingCurrency) {
            return;
          }
          return manager.save(currency);
        }),
      );
    });
  }

  private async readCsv(filePath: string): Promise<{
    countriesData: Country[];
    countryCurrenciesData: CountryCurrency[];
  }> {
    const countriesData: Country[] = [];
    const countryCurrenciesData: CountryCurrency[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(filePath)
        .pipe(csv.parse({ headers: true }))
        .transform((row: CountryCsvRow, next) => {
          return next(null, {
            country: {
              id: +row.id,
              name: row.name,
              iso2: row.iso2,
              iso3: row.iso3,
              numericCode: +row.numeric_code,
            },
            currency: {
              id: +row.id,
              currency: row.currency,
              country: {
                id: +row.id,
              },
            },
          });
        })
        .on('data', (data: IReadCsvData) => {
          const newCountry = this.countryRepo.create(data.country);
          countriesData.push(newCountry);

          const newCurrency = this.countryCurrencyRepo.create(data.currency);
          countryCurrenciesData.push(newCurrency);
        })
        .on('end', () => {
          resolve({
            countriesData,
            countryCurrenciesData,
          });
        })
        .on('error', (error: Error) => {
          reject(error);
        });
    });
  }
}
