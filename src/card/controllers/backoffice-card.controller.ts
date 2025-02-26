import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CARD_PERMISSIONS } from 'src/permission/permission.constant';
import { SwaggerBaseApiResponse } from 'src/shared/dtos/base-api-response.dto';

import { Permissions } from '../../auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from '../../auth/guards/jwt-operator-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  BackofficeCardOutputDto,
  BackofficeUpdateCardEarningTokenInput,
  BackofficeUpdateCardMaxOwnedInput,
  BackofficeUpdateCardNextCardDiscountPercentInput,
  BackofficeUpdateCardPriceInput,
} from '../dtos/backoffice-card.dto';
import { CardOutputDto } from '../dtos/card-output.dto';
import { BackofficeCardService } from '../services/backoffice-card.service';

@ApiBearerAuth()
@ApiTags('Backoffice/Card')
@Controller('backoffice/card')
@UseGuards(JwtOperatorAuthGuard, PermissionsGuard)
export class BackofficeCardController {
  constructor(private readonly backofficeCardService: BackofficeCardService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cards' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CardOutputDto]),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.READ)
  async findAll(
    @ReqContext() ctx: RequestContext,
  ): Promise<BackofficeCardOutputDto[]> {
    return this.backofficeCardService.findCards(ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a card by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOutputDto),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.READ)
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<BackofficeCardOutputDto> {
    return this.backofficeCardService.findCardById(ctx, id);
  }

  @Put('/price')
  @ApiOperation({ summary: 'Update a card price' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOutputDto),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.UPDATE)
  async updatePrice(
    @ReqContext() ctx: RequestContext,
    @Body() body: BackofficeUpdateCardPriceInput,
  ): Promise<{
    success: boolean;
  }> {
    return this.backofficeCardService.updateCardPrice(ctx, body);
  }

  @Put('/max-owned')
  @ApiOperation({ summary: 'Update a card max owned' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOutputDto),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.UPDATE)
  async updateMaxOwned(
    @ReqContext() ctx: RequestContext,
    @Body() body: BackofficeUpdateCardMaxOwnedInput,
  ): Promise<{
    success: boolean;
  }> {
    return this.backofficeCardService.updateCardMaxOwned(ctx, body);
  }

  @Put('/next-card-discount-percent')
  @ApiOperation({ summary: 'Update a card next card discount percent' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOutputDto),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.UPDATE)
  async updateNextCardDiscountPercent(
    @ReqContext() ctx: RequestContext,
    @Body() body: BackofficeUpdateCardNextCardDiscountPercentInput,
  ): Promise<{
    success: boolean;
  }> {
    return this.backofficeCardService.updateCardNextCardDiscountPercent(
      ctx,
      body,
    );
  }

  @Put('/earning-token')
  @ApiOperation({ summary: 'Update a card earning token' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOutputDto),
  })
  @Permissions(CARD_PERMISSIONS.MANAGE, CARD_PERMISSIONS.UPDATE)
  async updateEarningToken(
    @ReqContext() ctx: RequestContext,
    @Body() body: BackofficeUpdateCardEarningTokenInput,
  ): Promise<{
    success: boolean;
  }> {
    return this.backofficeCardService.updateCardEarningToken(ctx, body);
  }
}
