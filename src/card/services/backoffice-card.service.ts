import { Injectable } from '@nestjs/common';
import BigNumber from 'bignumber.js';
import { keyBy, map, some } from 'lodash';
import { CardUserRepository } from 'src/card/repositories/card-user.repository';
import { RewardService } from 'src/reward/services/reward.service';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import {
  AppExceptionCode,
  getAppException,
} from 'src/shared/exceptions/app.exception';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from 'src/shared/utils/class-transform';
import { UserBalanceService } from 'src/user-balance/services/user-balance.service';
import {
  Between,
  FindOptionsWhere,
  ILike,
  In,
  LessThan,
  MoreThan,
} from 'typeorm';
import { Transactional } from 'typeorm-transactional';

import {
  BackofficeCardOutputDto,
  BackofficeUpdateCardEarningTokenInput,
  BackofficeUpdateCardMaxOwnedInput,
  BackofficeUpdateCardNextCardDiscountPercentInput,
  BackofficeUpdateCardPriceInput,
} from '../dtos/backoffice-card.dto';
import {
  BackofficeCardOrderFilterDto,
  BackofficeCardOrderOutputDto,
} from '../dtos/backoffice-card-order.dto';
import { CardOrder, ECardOrderStatus } from '../entities/card-order.entity';
import { ECardUserStatus } from '../entities/card-user.entity';
import { CardRepository } from '../repositories/card.repository';
import { CardOrderRepository } from '../repositories/card-order.repository';

@Injectable()
export class BackofficeCardService {
  constructor(
    private readonly cardOrderRepository: CardOrderRepository,
    private readonly userBalanceService: UserBalanceService,
    private readonly cardRepository: CardRepository,
    private readonly rewardService: RewardService,
    private readonly cardUserRepository: CardUserRepository,
  ) { }

  async findOrders(
    _: RequestContext,
    filter: BackofficeCardOrderFilterDto,
    pagination: PaginationParamsDto,
  ) {
    const {
      countryId,
      from,
      to,
      keyword,
      status,
      sortBy = 'purchaseDate',
      sortOrder = 'DESC',
    } = filter;
    const { page, limit } = pagination;

    const condition: FindOptionsWhere<CardOrder> = {};

    if (keyword) {
      condition.user = {
        email: ILike(`%${keyword}%`),
      };
    }

    if (status) {
      condition.status = status;
    }

    if (countryId) {
      condition.countryId = countryId;
    }

    if (from) {
      if (to) {
        condition.purchaseDate = Between(from, to);
      } else {
        condition.purchaseDate = MoreThan(from);
      }
    }

    if (to) {
      if (from) {
        condition.purchaseDate = Between(from, to);
      } else {
        condition.purchaseDate = LessThan(to);
      }
    }

    const query = await this.cardOrderRepository
      .findAndCount({
        where: condition,
        relations: ['user', 'cardUsers', 'country', 'cardUsers.card'],
        skip: page * limit,
        take: limit,
        order: {
          [sortBy]: sortOrder,
        },
      });

    const [result, total] = plainToInstancesCustom(
      BackofficeCardOrderOutputDto,
      query,
    );

    return plainToInstanceCustom(
      PaginationResponseDto<BackofficeCardOrderOutputDto>,
      {
        data: result,
        total,
        page,
      },
    );
  }

  async findOrderById(_: RequestContext, id: string) {
    const order = await this.cardOrderRepository
      .findOne({
        where: { id },
        relations: ['cardUsers', 'country', 'cardUsers.card', 'user'],
      });

    if (!order) {
      throw getAppException(AppExceptionCode.CARD_ORDER_NOT_FOUND);
    }

    const result = plainToInstanceCustom(BackofficeCardOrderOutputDto, order);

    return result;
  }

  @Transactional()
  async refundOrder(ctx: RequestContext, id: string) {
    const order = await this.cardOrderRepository
      .findOne({ where: { id } });

    if (!order) {
      throw getAppException(AppExceptionCode.CARD_ORDER_NOT_FOUND);
    }

    if (order.status !== ECardOrderStatus.COMPLETED) {
      throw getAppException(AppExceptionCode.CARD_ORDER_NOT_COMPLETED);
    }

    const cardUsers = await this.cardUserRepository.find({ where: { cardOrderId: id } });

    const redeemedCardUsers = some(
      cardUsers,
      (cardUser) => cardUser.status === ECardUserStatus.REDEEMED,
    );
    if (redeemedCardUsers) {
      throw getAppException(AppExceptionCode.CARD_ALREADY_REDEEMED);
    }

    order.status = ECardOrderStatus.REFUNDED;
    await this.cardOrderRepository.save(order);

    let totalRefundAmount = new BigNumber(0);
    for (const cardUser of cardUsers) {
      totalRefundAmount = totalRefundAmount.plus(cardUser.purchasePrice);
      cardUser.status = ECardUserStatus.REFUNDED;
      cardUser.cardOrderNumber = -1;
      await this.cardUserRepository.save(cardUser);
    }

    await this.userBalanceService.increaseBalance(
      ctx,
      order.userId,
      totalRefundAmount.toString(),
    );

    await this.rewardService.decreaseReward(ctx, order.userId, order.rewardAmount);

    return {
      success: true,
    };
  }

  async findCards(_: RequestContext): Promise<BackofficeCardOutputDto[]> {
    const cards = await this.cardRepository.find();
    return plainToInstancesCustom(BackofficeCardOutputDto, cards);
  }

  async findCardById(
    _: RequestContext,
    id: string,
  ): Promise<BackofficeCardOutputDto> {
    const card = await this.cardRepository.findOne({ where: { id } });
    if (!card) {
      throw getAppException(AppExceptionCode.CARD_NOT_FOUND);
    }
    return plainToInstanceCustom(BackofficeCardOutputDto, card);
  }

  async updateCardPrice(
    _: RequestContext,
    body: BackofficeUpdateCardPriceInput,
  ) {
    const { cards } = body;
    const cardIds = map(cards, 'cardId');
    const existingCards = await this.cardRepository.find({
      where: { id: In(cardIds) },
    });

    if (existingCards.length !== cardIds.length) {
      throw getAppException(AppExceptionCode.CARD_IDS_PROVIDED_IS_INVALID);
    }

    const cardPriceMap = keyBy(cards, 'cardId');

    for (const card of existingCards) {
      const currency = cardPriceMap[card.id].currency;

      for (const price of card.price) {
        if (price.currency === currency) {
          price.amount = cardPriceMap[card.id].price;
        }
      }
    }

    await this.cardRepository.save(existingCards);

    return {
      success: true,
    };
  }

  async updateCardMaxOwned(
    _: RequestContext,
    body: BackofficeUpdateCardMaxOwnedInput,
  ) {
    const { cards } = body;
    const cardIds = map(cards, 'cardId');
    const existingCards = await this.cardRepository.find({
      where: { id: In(cardIds) },
    });

    if (existingCards.length !== cardIds.length) {
      throw getAppException(AppExceptionCode.CARD_IDS_PROVIDED_IS_INVALID);
    }

    const cardMaxOwnedMap = keyBy(cards, 'cardId');

    for (const card of existingCards) {
      card.maxOwned = cardMaxOwnedMap[card.id].maxOwned;
    }

    await this.cardRepository.save(existingCards);

    return {
      success: true,
    };
  }

  async updateCardNextCardDiscountPercent(
    _: RequestContext,
    body: BackofficeUpdateCardNextCardDiscountPercentInput,
  ) {
    const { cards } = body;
    const cardIds = map(cards, 'cardId');
    const existingCards = await this.cardRepository.find({
      where: { id: In(cardIds) },
    });

    const cardNextCardDiscountPercentMap = keyBy(cards, 'cardId');

    for (const card of existingCards) {
      card.nextCardDiscountPercent =
        cardNextCardDiscountPercentMap[card.id].nextCardDiscountPercent / 100;
    }

    await this.cardRepository.save(existingCards);

    return {
      success: true,
    };
  }

  async updateCardEarningToken(
    _: RequestContext,
    body: BackofficeUpdateCardEarningTokenInput,
  ) {
    const { cards } = body;
    const cardIds = map(cards, 'cardId');
    const existingCards = await this.cardRepository.find({
      where: { id: In(cardIds) },
    });

    const cardEarningTokenMap = keyBy(cards, 'cardId');

    for (const card of existingCards) {
      card.earningToken = cardEarningTokenMap[card.id].earningToken;
    }

    await this.cardRepository.save(existingCards);

    return {
      success: true,
    };
  }
}
