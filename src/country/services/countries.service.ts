import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  CountryFilterDto,
  CountryOutputDto,
} from 'src/country/dtos/country.dto';
import { CountryCurrencyOutputDto } from 'src/country/dtos/country-currency.dto';
import { Country } from 'src/country/entities/country.entity';
import { CountryCurrency } from 'src/country/entities/country-currency.entity';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from 'src/shared/utils/class-transform';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
    @InjectRepository(CountryCurrency)
    private readonly countryCurrencyRepo: Repository<CountryCurrency>,
  ) {}

  async findAll(_: RequestContext, filter: CountryFilterDto) {
    const { name } = filter;
    const condition: FindOptionsWhere<Country> = {};

    if (name) {
      condition.name = ILike(`%${name}%`);
    }

    const resp = await this.countryRepository.find({
      where: condition,
      order: {
        name: 'ASC',
      },
    });

    return plainToInstancesCustom(CountryOutputDto, resp);
  }

  findAllCurrencies() {
    return this.countryCurrencyRepo.find({
      relations: ['country'],
      order: {
        country: {
          name: 'ASC',
        },
      },
    });
  }

  findByAlphaCountry3Code(country3Code: string) {
    return this.countryRepository.findOne({ where: { iso3: country3Code } });
  }

  async findCurrenciesByCountryId(countryId: number) {
    const resp = await this.countryCurrencyRepo.find({
      where: {
        countryId,
      },
    });

    return plainToInstancesCustom(CountryCurrencyOutputDto, resp);
  }

  async getCountryById(_: RequestContext, id: number) {
    const resp = await this.countryRepository.findOne({
      where: {
        id,
      },
    });

    return plainToInstanceCustom(CountryOutputDto, resp);
  }
}
