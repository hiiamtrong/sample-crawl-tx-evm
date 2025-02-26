import { Body, Controller, Delete, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SwaggerBaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

import { AddToCartInputDto, CartOutputDto } from '../dtos/cart.dto';
import { CartService } from '../services/cart.service';

@ApiBearerAuth()
@ApiTags('Cart')
@Controller('cart')
@UseGuards(JwtUserAuthGuard)
export class CartController {
  constructor(private readonly cartService: CartService) { }

  @Post()
  @ApiOperation({ summary: 'Add card to cart' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CartOutputDto),
  })
  async addToCart(
    @ReqContext() ctx: RequestContext,
    @Body() input: AddToCartInputDto,
  ): Promise<CartOutputDto> {
    return this.cartService.addToCart(ctx, input);
  }

  @Get()
  @ApiOperation({ summary: 'Get cart items' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(CartOutputDto),
  })
  async findCart(@ReqContext() ctx: RequestContext): Promise<CartOutputDto> {
    return this.cartService.findCart(ctx);
  }

  @Delete()
  @ApiOperation({ summary: 'Clear cart' })
  @ApiResponse({
    status: HttpStatus.OK,
  })
  async clear(@ReqContext() ctx: RequestContext): Promise<void> {
    return this.cartService.clear(ctx);
  }
} 
