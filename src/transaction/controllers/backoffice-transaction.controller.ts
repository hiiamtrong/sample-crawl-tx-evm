import { Controller, Get, HttpStatus, Query, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from 'src/auth/guards/jwt-operator-auth.guard';
import { TRANSACTION_PERMISSIONS } from 'src/permission/permission.constant';
import { PaginationResponseDto, SwaggerBaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

import {
  BackofficeAssetTransactionFilterDto,
  BackofficeAssetTransactionOutputDto,
} from '../dtos/backoffice-asset-transaction.dto';
import { BackofficeTransactionService } from '../services/ backoffice-transaction.service';

@Controller('/backoffice/transactions')
@ApiTags('Backoffice Transaction')
@ApiBearerAuth()
export class BackofficeTransactionController {
  constructor(
    private readonly backofficeTransactionService: BackofficeTransactionService,
  ) {}

  @UseGuards(JwtOperatorAuthGuard)
  @Get('/')
  @Permissions(TRANSACTION_PERMISSIONS.READ, TRANSACTION_PERMISSIONS.MANAGE)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BackofficeAssetTransactionOutputDto]),
  })
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query() pagination: PaginationParamsDto,
    @Query() filter: BackofficeAssetTransactionFilterDto,
  ): Promise<PaginationResponseDto<BackofficeAssetTransactionOutputDto>> {
    return this.backofficeTransactionService.findAll(ctx, filter, pagination);
  }

  @UseGuards(JwtOperatorAuthGuard)
  @Get('/export-csv')
  @Permissions(TRANSACTION_PERMISSIONS.READ, TRANSACTION_PERMISSIONS.MANAGE)
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BackofficeAssetTransactionOutputDto]),
  })
  async exportCsv(
    @ReqContext() ctx: RequestContext,
    @Query() pagination: PaginationParamsDto,
    @Query() filter: BackofficeAssetTransactionFilterDto,
    @Res() res: Response,
  ) {
    const csvBuffer = await this.backofficeTransactionService.exportCsv(
      ctx,
      filter,
      pagination,
    );
    let filename = 'card_transactions';
    if (filter.from && filter.to) {
      filename += `_${filter.from}_${filter.to}`;
    } else {
      filename += `_all_time`;
    }
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${filename}.csv`,
    );

    res.status(200).send(csvBuffer);
  }
}
