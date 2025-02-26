import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import BigNumber from 'bignumber.js';
import { reduce } from 'lodash';
import { CardOrderOutputDto } from 'src/card/dtos/card-order.dto';
import {
  CardPurchaseInputDto,
  PurchaseCardEstimateOutputDto,
  PurchaseCardInputDto,
  PurchaseCardOutputDto,
} from 'src/card/dtos/purchase-card.dto';
import { CardUser, ECardUserStatus } from 'src/card/entities/card-user.entity';
import { CardOrderRepository } from 'src/card/repositories/card-order.repository';
import { CardUserRepository } from 'src/card/repositories/card-user.repository';
import { CartService } from 'src/cart/services/cart.service';
import { CountriesService } from 'src/country/services/countries.service';
import { RewardService } from 'src/reward/services/reward.service';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from 'src/shared/utils/class-transform';
import { UserService } from 'src/user/services/user.service';
import { UserBalanceService } from 'src/user-balance/services/user-balance.service';
import { In, Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import {
  AppExceptionCode,
  getAppException,
} from '../../shared/exceptions/app.exception';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  CardOutputDto,
  CardUserOutputDto,
  CountByCardOutputDto,
} from '../dtos/card-output.dto';
import { Card } from '../entities/card.entity';

@Injectable()
export class CardService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,

    private readonly cardUserRepository: CardUserRepository,

    private readonly userBalanceService: UserBalanceService,

    private readonly cardOrderRepository: CardOrderRepository,

    private readonly countriesService: CountriesService,

    private readonly rewardService: RewardService,

    private readonly userService: UserService,

    private readonly cartService: CartService,
  ) { }

  async findAll(_: RequestContext): Promise<CardOutputDto[]> {
    const cards = await this.cardRepository.find();
    return plainToInstancesCustom(CardOutputDto, cards);
  }

  async findOne(_: RequestContext, id: string): Promise<CardOutputDto> {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) {
      throw getAppException(AppExceptionCode.CARD_NOT_FOUND);
    }
    return plainToInstanceCustom(CardOutputDto, card);
  }

  async delete(_: RequestContext, id: string): Promise<void> {
    try {
      const result = await this.cardRepository.delete(id);
      if (result.affected === 0) {
        throw getAppException(AppExceptionCode.CARD_NOT_FOUND);
      }
    } catch (error) {
      throw getAppException(AppExceptionCode.CARD_DELETION_FAILED).wrapError(
        error,
      );
    }
  }

  @Transactional()
  async purchase(
    ctx: RequestContext,
    body: PurchaseCardInputDto,
  ): Promise<PurchaseCardOutputDto> {


    const user = ctx.user;

    const existingUser = await this.userService.findById(ctx, user.id);
    if (!existingUser.email) {
      throw getAppException(AppExceptionCode.USER_EMAIL_NOT_VERIFIED);
    }

    if (existingUser.disabledPurchase) {
      throw getAppException(AppExceptionCode.USER_DISABLED_PURCHASE);
    }

    const country = await this.countriesService.getCountryById(
      ctx,
      body.countryId,
    );

    if (!country) {
      throw getAppException(AppExceptionCode.COUNTRY_NOT_FOUND);
    }

    if (country.blacklisted) {
      throw getAppException(AppExceptionCode.COUNTRY_BLACKLISTED);
    }

    await this.userService.updateCountry(ctx, ctx.user.id, body.countryId);

    const cards = await this.cardRepository.find({
      where: { id: In(body.cards.map((card) => card.cardId)) },
    });
    if (!cards || cards.length !== body.cards.length) {
      throw getAppException(AppExceptionCode.CARD_NOT_FOUND, {
        cardIds: body.cards.filter(
          (card) => !cards.find((c) => c.id === card.cardId),
        ),
      });
    }


    const groupedCards: { cardId: string; count: number }[] =
      await this.cardUserRepository
        .createQueryBuilder('cardUser')
        .select('cardUser.cardId', 'cardId')
        .addSelect('COUNT(cardUser.id)', 'count')
        .where('cardUser.userId = :userId', { userId: user.id })
        .andWhere('cardUser.status IN (:...statuses)', { statuses: [ECardUserStatus.AVAILABLE, ECardUserStatus.REDEEMED] })
        .groupBy('cardUser.cardId')
        .getRawMany();

    const groupedCardsMap = reduce(
      groupedCards,
      (acc, card) => {
        acc[card.cardId] = card.count;
        return acc;
      },
      {},
    );

    let totalPrice = new BigNumber(0);
    const newCardUsers: CardUser[] = [];
    let totalEarnedReward = new BigNumber(0);
    let totalDiscountAmount = new BigNumber(0);
    const newCardOrders = reduce<CardPurchaseInputDto, string[]>(
      body.cards,
      (acc, card) => {
        const newCardAmount = card.amount;
        for (let i = 0; i < newCardAmount; i++) {
          acc.push(card.cardId);
        }
        return acc;
      },
      [],
    );

    for (const cardId of newCardOrders) {
      const cardOrderNumber = groupedCardsMap[cardId]
        ? +groupedCardsMap[cardId] + 1
        : 1;

      const card = cards.find((c) => c.id === cardId);

      if (!card) {
        throw getAppException(AppExceptionCode.CARD_NOT_FOUND);
      }

      if (cardOrderNumber > card.maxOwned) {
        throw getAppException(AppExceptionCode.CARD_MAX_OWNED, {
          cardId,
          cardOrderNumber,
          maxOwned: card.maxOwned,
        });
      }
      const discountPercent =
        cardOrderNumber > 1 ? card.nextCardDiscountPercent : 0;

      const price = card.price.find(
        (price) => price.currency === body.currency,
      );

      if (!price) {
        throw getAppException(AppExceptionCode.CARD_PRICE_NOT_SUPPORTED, {
          currency: body.currency,
        });
      }
      const cardPrice = new BigNumber(price.amount).times(
        new BigNumber(1).minus(discountPercent),
      );

      const rewardAmount = card.earningToken;

      const discountAmount = new BigNumber(price.amount).minus(cardPrice);

      const cardUser = this.cardUserRepository.create({
        cardId: card.id,
        userId: user.id,
        cardOrderNumber,
        cardPriceCurrency: body.currency,
        purchaseDate: new Date(),
        purchasePrice: cardPrice.toString(),
        discountPercent: discountPercent.toString(),
        rewardAmount: rewardAmount ? rewardAmount.toString() : '0',
      });
      newCardUsers.push(cardUser);
      totalPrice = totalPrice.plus(cardPrice);
      groupedCardsMap[cardId] = cardOrderNumber;
      if (rewardAmount) {
        totalEarnedReward = totalEarnedReward.plus(rewardAmount);
      }
      totalDiscountAmount = totalDiscountAmount.plus(discountAmount);
    }

    const cardOrder = this.cardOrderRepository.create({
      userId: user.id,
      totalPrice: totalPrice.toString(),
      cardPriceCurrency: body.currency,
      purchaseDate: new Date(),
      countryId: country.id,
      rewardAmount: totalEarnedReward.toString(),
      totalDiscountAmount: totalDiscountAmount.toString(),
    });

    await this.cardOrderRepository.save(cardOrder);

    for (const cardUser of newCardUsers) {
      cardUser.cardOrder = cardOrder;
    }

    const userBalance = await this.userBalanceService.getOrCreateUserBalance(
      ctx,
      user.id,
    );

    if (new BigNumber(userBalance.amount).lt(totalPrice)) {
      throw getAppException(AppExceptionCode.INSUFFICIENT_BALANCE);
    }
    await this.userBalanceService.decreaseBalance(
      ctx,
      user.id,
      totalPrice.toString(),
    );

    await this.rewardService.increaseReward(
      ctx,
      user.id,
      totalEarnedReward.toString(),
    );

    await this.cardUserRepository.save(newCardUsers);

    // remove cart
    if (body.cartId) {
      await this.cartService.removeCart(ctx, body.cartId);
    }

    return plainToInstanceCustom(PurchaseCardOutputDto, {
      orderId: cardOrder.id,
    });
  }

  async myCards(ctx: RequestContext): Promise<CardUserOutputDto[]> {
    const user = ctx.user;
    const cardUsers = await this.cardUserRepository

      .find({
        where: { userId: user.id },
        order: { cardId: 'ASC', cardOrderNumber: 'ASC' },
        relations: ['card'],
      });
    return plainToInstancesCustom(CardUserOutputDto, cardUsers);
  }

  async myOrders(
    ctx: RequestContext,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<CardOrderOutputDto>> {
    const user = ctx.user;
    const cardOrders = await this.cardOrderRepository
      .find({
        where: { userId: user.id },
        relations: ['cardUsers', 'cardUsers.card', 'country'],
        skip: pagination.page * pagination.limit,
        take: pagination.limit,
        order: { purchaseDate: 'DESC' },
      });

    const total = await this.cardOrderRepository
      .count({ where: { userId: user.id } });

    const resp = {
      data: plainToInstancesCustom(CardOrderOutputDto, cardOrders),
      total,
      page: pagination.page,
    };

    return plainToInstanceCustom(
      PaginationResponseDto<CardOrderOutputDto>,
      resp,
    );
  }

  async orderDetail(
    ctx: RequestContext,
    orderId: string,
  ): Promise<CardOrderOutputDto> {
    const user = ctx.user;
    const cardOrder = await this.cardOrderRepository
      .findOne({
        where: { id: orderId, userId: user.id },
        relations: ['cardUsers', 'cardUsers.card', 'country'],
      });
    return plainToInstanceCustom(CardOrderOutputDto, cardOrder);
  }

  async estimatePrice(
    ctx: RequestContext,
    body: PurchaseCardInputDto,
  ): Promise<PurchaseCardEstimateOutputDto> {
    const country = await this.countriesService.getCountryById(
      ctx,
      body.countryId,
    );

    if (!country) {
      throw getAppException(AppExceptionCode.COUNTRY_NOT_FOUND);
    }

    const cards = await this.cardRepository.find({
      where: { id: In(body.cards.map((card) => card.cardId)) },
    });
    if (!cards || cards.length !== body.cards.length) {
      throw getAppException(AppExceptionCode.CARD_NOT_FOUND, {
        cardIds: body.cards.filter(
          (card) => !cards.find((c) => c.id === card.cardId),
        ),
      });
    }

    const user = ctx.user;

    const groupedCards: { cardId: string; count: number }[] =
      await this.cardUserRepository
        .createQueryBuilder('cardUser')
        .select('cardUser.cardId', 'cardId')
        .addSelect('COUNT(cardUser.id)', 'count')
        .where('cardUser.userId = :userId', { userId: user.id })
        .andWhere('cardUser.status IN (:...statuses)', { statuses: [ECardUserStatus.AVAILABLE, ECardUserStatus.REDEEMED] })
        .groupBy('cardUser.cardId')
        .getRawMany();

    const groupedCardsMap = reduce(
      groupedCards,
      (acc, card) => {
        acc[card.cardId] = card.count;
        return acc;
      },
      {},
    );

    let totalPrice = new BigNumber(0);
    let totalDiscountAmount = new BigNumber(0);
    const newCardUsers: CardUser[] = [];
    let totalEarnedReward = new BigNumber(0);

    const newCardOrders = reduce<CardPurchaseInputDto, string[]>(
      body.cards,
      (acc, card) => {
        const newCardAmount = card.amount;
        for (let i = 0; i < newCardAmount; i++) {
          acc.push(card.cardId);
        }
        return acc;
      },
      [],
    );

    for (const cardId of newCardOrders) {
      const cardOrderNumber = groupedCardsMap[cardId]
        ? +groupedCardsMap[cardId] + 1
        : 1;

      const card = cards.find((c) => c.id === cardId);

      if (!card) {
        throw getAppException(AppExceptionCode.CARD_NOT_FOUND);
      }

      if (cardOrderNumber > card.maxOwned) {
        throw getAppException(AppExceptionCode.CARD_MAX_OWNED, {
          cardId,
          cardOrderNumber,
          maxOwned: card.maxOwned,
        });
      }
      const discountPercent =
        cardOrderNumber > 1 ? card.nextCardDiscountPercent : 0;

      const price = card.price.find(
        (price) => price.currency === body.currency,
      );

      if (!price) {
        throw getAppException(AppExceptionCode.CARD_PRICE_NOT_SUPPORTED, {
          currency: body.currency,
        });
      }

      const cardPrice = new BigNumber(price.amount).times(
        new BigNumber(1).minus(discountPercent),
      );

      const discountAmount = new BigNumber(price.amount).minus(cardPrice);

      const rewardAmount = card.earningToken;

      if (rewardAmount) {
        totalEarnedReward = totalEarnedReward.plus(rewardAmount);
      }

      const cardUser = this.cardUserRepository.create({
        cardId: card.id,
        userId: user.id,
        cardOrderNumber,
        cardPriceCurrency: body.currency,
        purchaseDate: new Date(),
        purchasePrice: cardPrice.toString(),
        discountPercent: discountPercent.toString(),
        rewardAmount: rewardAmount ? rewardAmount.toString() : '0',
      });
      newCardUsers.push(cardUser);
      totalPrice = totalPrice.plus(cardPrice);

      groupedCardsMap[cardId] = cardOrderNumber;
      totalDiscountAmount = totalDiscountAmount.plus(discountAmount);
    }

    return plainToInstanceCustom(PurchaseCardEstimateOutputDto, {
      totalPrice: totalPrice.toString(),
      cards: newCardUsers,
      totalEarnedReward: totalEarnedReward.toString(),
      totalDiscountAmount: totalDiscountAmount.toString(),
    });
  }

  async countByCard(ctx: RequestContext): Promise<CountByCardOutputDto> {
    const user = ctx.user;

    const groupedCards = await this.cardUserRepository

      .createQueryBuilder('cardUser')
      .select('cardUser.cardId', 'cardId')
      .addSelect('COUNT(cardUser.id)', 'owned')
      .where('cardUser.userId = :userId', { userId: user.id })
      .andWhere('cardUser.status IN (:...statuses)', { statuses: [ECardUserStatus.AVAILABLE, ECardUserStatus.REDEEMED] })
      .groupBy('cardUser.cardId')
      .getRawMany();

    return plainToInstanceCustom(CountByCardOutputDto, groupedCards);
  }
}
