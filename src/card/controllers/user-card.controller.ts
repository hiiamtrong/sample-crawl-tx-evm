import {
  Body,
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
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CardOrderOutputDto } from 'src/card/dtos/card-order.dto';
import {
  PurchaseCardEstimateOutputDto,
  PurchaseCardInputDto,
  PurchaseCardOutputDto,
} from 'src/card/dtos/purchase-card.dto';
import {
  PaginationResponseDto,
  SwaggerBaseApiResponse,
} from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';

import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { CardOutputDto, CardUserOutputDto, CountByCardOutputDto } from '../dtos/card-output.dto';
import { CardService } from '../services/card.service';

@ApiBearerAuth()
@ApiTags('User/Card')
@Controller('card')
export class UserCardController {
  constructor(private readonly cardService: CardService) { }

  @Get()
  @ApiOperation({ summary: 'Get all cards' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CardOutputDto]),
  })
  async findAll(@ReqContext() ctx: RequestContext): Promise<CardOutputDto[]> {
    return this.cardService.findAll(ctx);
  }

  @Get('/my-cards')
  @ApiOperation({ summary: 'Get all cards' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CardUserOutputDto]),
  })
  @UseGuards(JwtUserAuthGuard)
  async myCards(
    @ReqContext() ctx: RequestContext,
  ): Promise<CardUserOutputDto[]> {
    return this.cardService.myCards(ctx);
  }

  @Get('/my-cards/count-by-card')
  @ApiOperation({ summary: 'Get all owned cards' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CardUserOutputDto]),
  })
  @UseGuards(JwtUserAuthGuard)
  async countByCard(@ReqContext() ctx: RequestContext): Promise<CountByCardOutputDto> {
    return this.cardService.countByCard(ctx);
  }

  @Get('/my-orders')
  @ApiOperation({ summary: 'Get all orders' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([CardOrderOutputDto]),
  })
  @UseGuards(JwtUserAuthGuard)
  async myOrders(
    @ReqContext() ctx: RequestContext,
    @Query() pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<CardOrderOutputDto>> {
    return this.cardService.myOrders(ctx, pagination);
  }

  @Get('/my-orders/:id')
  @ApiOperation({ summary: 'Get an order by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOrderOutputDto),
  })
  @UseGuards(JwtUserAuthGuard)
  async orderDetail(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<CardOrderOutputDto> {
    return this.cardService.orderDetail(ctx, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a card by id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CardOutputDto),
  })
  async findOne(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<CardOutputDto> {
    return this.cardService.findOne(ctx, id);
  }

  @UseGuards(JwtUserAuthGuard)
  @Post('/purchase')
  @ApiOperation({ summary: 'Purchase a card' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(PurchaseCardOutputDto),
  })

  async purchase(
    @ReqContext() ctx: RequestContext,
    @Body() body: PurchaseCardInputDto,
  ): Promise<PurchaseCardOutputDto> {
    return this.cardService.purchase(ctx, body);
  }

  @Post('/purchase/estimate')
  @ApiOperation({ summary: 'Estimate the price of a card' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(PurchaseCardEstimateOutputDto),
  })
  @UseGuards(JwtUserAuthGuard)
  async estimate(
    @ReqContext() ctx: RequestContext,
    @Body() body: PurchaseCardInputDto,
  ): Promise<PurchaseCardEstimateOutputDto> {
    return this.cardService.estimatePrice(ctx, body);
  }
}
