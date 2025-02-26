import { Controller, Get, HttpStatus, Param, Query } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CountryFilterDto,
  CountryOutputDto,
} from 'src/country/dtos/country.dto';
import { CountryCurrencyOutputDto } from 'src/country/dtos/country-currency.dto';
import { CountriesService } from 'src/country/services/countries.service';
import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from 'src/shared/dtos/base-api-response.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

@ApiTags('Countries')
@Controller('countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CountryOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query() filter: CountryFilterDto,
  ) {
    const result = await this.countriesService.findAll(ctx, filter);
    return result;
  }

  @Get(':id/currencies')
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CountryCurrencyOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async findOne(@Param('id') id: string) {
    const result = await this.countriesService.findCurrenciesByCountryId(+id);
    return result;
  }
}
