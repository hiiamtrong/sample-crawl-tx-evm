import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Country } from 'src/country/entities/country.entity';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  AppExceptionCode,
  getAppException,
} from 'src/shared/exceptions/app.exception';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { plainToInstanceCustom, plainToInstancesCustom } from 'src/shared/utils/class-transform';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';

import {
  BackofficeCountryFilterDto,
  BackofficeCountryOutputDto,
} from '../dtos/backoffice-country.dto';

@Injectable()
export class BackofficeCountriesService {
  constructor(
    @InjectRepository(Country)
    private countryRepository: Repository<Country>,
  ) { }

  async findAll(_: RequestContext, filter: BackofficeCountryFilterDto, pagination: PaginationParamsDto): Promise<PaginationResponseDto<BackofficeCountryOutputDto>> {
    const { name, blacklisted } = filter;
    const condition: FindOptionsWhere<Country> = {};

    if (name) {
      condition.name = ILike(`%${name}%`);
    }

    if (blacklisted !== undefined) {
      condition.blacklisted = blacklisted;
    }

    const [result, total] = await this.countryRepository.findAndCount({
      where: condition,
      order: {
        name: 'ASC',
      },
      take: pagination.limit,
      skip: pagination.page * pagination.limit,
    });


    return plainToInstanceCustom(PaginationResponseDto<BackofficeCountryOutputDto>, {
      data: plainToInstancesCustom(BackofficeCountryOutputDto, result),
      total,
      page: pagination.page,
    });
  }

  async toggleBlacklistCountry(_: RequestContext, id: number) {
    const country = await this.countryRepository.findOne({
      where: { id },
    });

    if (!country) {
      throw getAppException(AppExceptionCode.COUNTRY_NOT_FOUND);
    }

    country.blacklisted = !country.blacklisted;
    await this.countryRepository.save(country);
  }
}
