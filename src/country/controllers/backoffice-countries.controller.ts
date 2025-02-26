import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from 'src/auth/guards/jwt-operator-auth.guard';
import { COUNTRY_PERMISSIONS } from 'src/permission/permission.constant';
import {
  BaseApiErrorResponse,
  SwaggerBaseApiResponse,
} from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

import {
  BackofficeCountryFilterDto,
  BackofficeCountryOutputDto,
} from '../dtos/backoffice-country.dto';
import { BackofficeCountriesService } from '../services/backoffice-countries.service';

@ApiTags('Backoffice Countries')
@Controller('backoffice/countries')
@UseGuards(JwtOperatorAuthGuard)
@ApiBearerAuth()
export class BackofficeCountriesController {
  constructor(
    private readonly backofficeCountriesService: BackofficeCountriesService,
  ) { }

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BackofficeCountryOutputDto]),
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    type: BaseApiErrorResponse,
  })
  @Permissions(COUNTRY_PERMISSIONS.READ, COUNTRY_PERMISSIONS.MANAGE)
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query() filter: BackofficeCountryFilterDto,
    @Query() pagination: PaginationParamsDto,
  ) {
    const result = await this.backofficeCountriesService.findAll(ctx, filter, pagination);
    return result;
  }

  @Put('/:id/toggle-blacklist')
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(BackofficeCountryOutputDto),
  })
  @Permissions(COUNTRY_PERMISSIONS.MANAGE)
  async toggleBlacklistCountry(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ) {
    return this.backofficeCountriesService.toggleBlacklistCountry(ctx, +id);
  }
}
