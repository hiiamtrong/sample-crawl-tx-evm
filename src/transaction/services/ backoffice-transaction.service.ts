import { Injectable } from '@nestjs/common';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from 'src/shared/utils/class-transform';
import { convertArrayOfObjectsToCSV } from 'src/shared/utils/csv';
import { AssetTransaction } from 'src/transaction/entities/asset-transaction.entity';
import { AssetTransactionRepository } from 'src/transaction/repositories/asset-transaction.repository';
import { Equal, FindOptionsWhere, ILike, LessThan, MoreThan } from 'typeorm';

import {
  BackofficeAssetTransactionFilterDto,
  BackofficeAssetTransactionOutputDto,
} from '../dtos/backoffice-asset-transaction.dto';
@Injectable()
export class BackofficeTransactionService {
  constructor(
    private readonly assetTransactionRepo: AssetTransactionRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(BackofficeTransactionService.name);
  }

  async findAll(
    _: RequestContext,
    filter: BackofficeAssetTransactionFilterDto,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<BackofficeAssetTransactionOutputDto>> {
    const { type, from, to, keyword, status } = filter;
    const condition: FindOptionsWhere<AssetTransaction> = {};

    if (keyword) {
      condition.user = {
        email: ILike(`%${keyword}%`),
      };
    }

    if (status) {
      condition.status = Equal(status);
    }

    if (type) {
      condition.type = Equal(type);
    }

    if (from) {
      condition.createdAt = MoreThan(from);
    }

    if (to) {
      condition.createdAt = LessThan(to);
    }

    const assetTransactions = await this.assetTransactionRepo

      .find({
        where: condition,
        order: { createdAt: 'DESC' },
        skip: pagination.page * pagination.limit,
        take: pagination.limit,
        relations: ['assetToken', 'user'],
      });

    const total = await this.assetTransactionRepo

      .count({ where: condition });

    const resp = {
      data: plainToInstancesCustom(
        BackofficeAssetTransactionOutputDto,
        assetTransactions,
      ),
      total,
      page: pagination.page,
    };

    return plainToInstanceCustom(
      PaginationResponseDto<BackofficeAssetTransactionOutputDto>,
      resp,
    );
  }

  async exportCsv(
    ctx: RequestContext,
    filter: BackofficeAssetTransactionFilterDto,
    pagination: PaginationParamsDto,
  ) {
    const data = await this.findAll(ctx, filter, pagination);
    const csv = convertArrayOfObjectsToCSV(data.data);
    const csvBuffer = Buffer.from(csv, 'utf-8');
    return csvBuffer;
  }
}
