import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CARD_PERMISSIONS } from 'src/permission/permission.constant';
import {
  PaginationResponseDto,
  SwaggerBaseApiResponse,
} from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';

import { Permissions } from '../../auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from '../../auth/guards/jwt-operator-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  BackofficeCardOrderFilterDto,
  BackofficeCardOrderOutputDto,
} from '../dtos/backoffice-card-order.dto';
import { CardOutputDto } from '../dtos/card-output.dto';
import { BackofficeCardService } from '../services/backoffice-card.service';

@ApiBearerAuth()
@ApiTags('Backoffice/Card-Order')
@Controller('backoffice/card-order')
@UseGuards(JwtOperatorAuthGuard, PermissionsGuard)
export class BackofficeCardOrderController {
  constructor(private readonly backofficeCardService: BackofficeCardService) {}

  @Get()
  @ApiOperation({ summary: 'Get all card orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([BackofficeCardOrderOutputDto]),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.READ)
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query() filter: BackofficeCardOrderFilterDto,
    @Query() pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<BackofficeCardOrderOutputDto>> {
    return this.backofficeCardService.findOrders(ctx, filter, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a card order by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOutputDto),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.READ)
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BackofficeCardOrderOutputDto> {
    return this.backofficeCardService.findOrderById(ctx, id);
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Refund a card order' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(Boolean),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.UPDATE)
  async refund(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<{ success: boolean }> {
    return this.backofficeCardService.refundOrder(ctx, id);
  }
}
