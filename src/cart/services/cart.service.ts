import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CardRepository } from 'src/card/repositories/card.repository';
import { Country } from 'src/country/entities/country.entity';
import { AppExceptionCode, getAppException } from 'src/shared/exceptions/app.exception';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { plainToInstanceCustom } from 'src/shared/utils/class-transform';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import { AddToCartInputDto, CartOutputDto, UpdateAmountInputDto } from '../dtos/cart.dto';
import { Cart } from '../entities/cart.entity';
import { CartItem } from '../entities/cart-item.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    private readonly cardRepository: CardRepository,
    @InjectRepository(Country)
    private readonly countryRepository: Repository<Country>,
  ) { }

  @Transactional()
  async addToCart(ctx: RequestContext, input: AddToCartInputDto): Promise<CartOutputDto> {

    if (input.countryId) {
      const country = await this.countryRepository.findOne({
        where: { id: input.countryId },
      });

      if (!country) {
        throw getAppException(AppExceptionCode.COUNTRY_NOT_FOUND);
      }
    }


    let cart = await this.cartRepository.findOne({
      where: { userId: ctx.user.id },
    });


    if (!cart) {
      cart = this.cartRepository.create({ userId: ctx.user.id, countryId: input.countryId });
      await this.cartRepository.save(cart);
    } else {
      cart.countryId = input.countryId;
      await this.cartRepository.save(cart);
    }

    // Delete all items in cart
    await this.cartItemRepository.delete({ cartId: cart.id });

    for (const item of input.items) {
      const card = await this.cardRepository.findOne({
        where: { id: item.cardId },
      });

      if (!card) {
        throw getAppException(AppExceptionCode.CARD_NOT_FOUND);
      }

      const cartItem = this.cartItemRepository.create({
        cartId: cart.id,
        cardId: item.cardId,
        amount: item.amount,
      });
      await this.cartItemRepository.save(cartItem);
    }

    return this.findOne(ctx, cart.id);
  }

  async findOne(ctx: RequestContext, id: string): Promise<CartOutputDto> {
    const cart = await this.cartRepository.findOne({
      where: { id, userId: ctx.user.id },
      relations: ['items', 'items.card', 'country'],
    });

    if (!cart) {
      throw getAppException(AppExceptionCode.CART_NOT_FOUND);
    }

    return plainToInstanceCustom(CartOutputDto, cart);
  }

  async findCart(ctx: RequestContext): Promise<CartOutputDto> {
    const cart = await this.cartRepository.findOne({
      where: { userId: ctx.user.id },
      relations: ['items', 'items.card', 'country'],
    });

    return plainToInstanceCustom(CartOutputDto, cart);
  }


  @Transactional()
  async remove(ctx: RequestContext, id: string): Promise<void> {
    const cartItemIds = await this.cartItemRepository.find({
      where: { cart: { id, userId: ctx.user.id } },
      select: ['id'],
    });

    await this.cartItemRepository.delete(cartItemIds.map(item => item.id));

    await this.cartRepository.delete({ id, userId: ctx.user.id });

    return;
  }

  @Transactional()
  async removeItem(ctx: RequestContext, cartId: string, cartItemId: string): Promise<void> {
    const cartItem = await this.cartItemRepository.findOne({
      where: { id: cartItemId, cart: { id: cartId, userId: ctx.user.id } },
    });

    if (!cartItem) {
      throw getAppException(AppExceptionCode.CART_ITEM_NOT_FOUND);
    }

    await this.cartItemRepository.delete({
      id: cartItem.id,
    });

    const cart = await this.cartRepository.findOne({
      where: { id: cartId, userId: ctx.user.id },
      relations: ['items'],
    });

    console.log({ cart });

    if (cart.items.length === 0) {
      await this.cartRepository.delete({ id: cartId, userId: ctx.user.id });
    }
  }

  async updateAmount(ctx: RequestContext, cartId: string, input: UpdateAmountInputDto): Promise<void> {
    if (input.amount === 0) {
      console.log({ cartId, input });
      return this.removeItem(ctx, cartId, input.cartItemId);
    }

    const cartItem = await this.cartItemRepository.findOne({
      where: { id: input.cartItemId, cart: { id: cartId, userId: ctx.user.id } },
    });

    if (!cartItem) {
      throw getAppException(AppExceptionCode.CART_ITEM_NOT_FOUND);
    }

    cartItem.amount = input.amount;
    await this.cartItemRepository.save(cartItem);
  }

  async clear(ctx: RequestContext): Promise<void> {
    const cart = await this.cartRepository.findOne({
      where: { userId: ctx.user.id },
    });

    if (cart) {
      await this.cartItemRepository.delete({ cartId: cart.id });
    }
  }

  async removeCart(ctx: RequestContext, id: string): Promise<void> {
    await this.cartItemRepository.delete({ cartId: id });
    await this.cartRepository.delete({ id, userId: ctx.user.id });
  }
} 
