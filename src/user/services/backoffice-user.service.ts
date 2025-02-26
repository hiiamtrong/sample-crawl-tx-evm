import { Injectable } from '@nestjs/common';
import { CardUserRepository } from 'src/card/repositories/card-user.repository';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { In } from 'typeorm';

import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from '../../shared/utils/class-transform';
import { BackofficeUserFilterDto } from '../dtos/backoffice-user.dto';
import { BackofficeUserOutput, UserOutput } from '../dtos/user-output.dto';
import { UserStatus } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class BackofficeUserService {
  constructor(
    private repository: UserRepository,
    private cardUserRepository: CardUserRepository,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(BackofficeUserService.name);
  }


  async getUsers(
    ctx: RequestContext,
    filter: BackofficeUserFilterDto,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<BackofficeUserOutput>> {
    const queryRunner = ctx.queryRunner;
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findAndCount`);

    const query = this.repository

      .createQueryBuilder('user', queryRunner)
      .leftJoinAndSelect('user.country', 'country')
      .skip(pagination.page * pagination.limit)
      .take(pagination.limit);

    if (filter.keyword) {
      query.andWhere('user.email ILIKE :keyword', { keyword: `%${filter.keyword}%` });
    }

    if (filter.status) {
      query.andWhere('user.status = :status', { status: filter.status });
    }

    const [users, count] = await query.getManyAndCount();

    const userIds = users.map((user) => user.id);

    const userCards = await this.cardUserRepository.find({
      where: {
        userId: In(userIds),
      },
    });

    const countByUser = userCards.reduce((acc, card) => {
      acc[card.userId] = (acc[card.userId] || 0) + 1;
      return acc;
    }, {});



    const usersOutput = plainToInstancesCustom(BackofficeUserOutput, users);

    usersOutput.forEach((user) => {
      user.numberOfCards = countByUser[user.id] || 0;
    });

    return plainToInstanceCustom(PaginationResponseDto<BackofficeUserOutput>, {
      data: usersOutput,
      total: count,
      page: pagination.page,
    });
  }


  async findById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findById.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
    const user = await this.repository.findOne({
      where: { id },
      relations: ['country'],
    });
    return plainToInstanceCustom(UserOutput, user);
  }

  async getUserById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.getUserById.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
    const user = await this.repository.getById(id);

    return plainToInstanceCustom(UserOutput, user);
  }


  async updateStatus(
    ctx: RequestContext,
    userId: string,
    status: UserStatus,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateStatus.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
    const user = await this.repository.getById(userId);

    user.status = status;

    this.logger.log(ctx, `calling ${UserRepository.name}.save`);
    await this.repository.save(user);
    return plainToInstanceCustom(UserOutput, user);
  }

  async activateUser(ctx: RequestContext, userId: string): Promise<UserOutput> {
    return this.updateStatus(ctx, userId, UserStatus.ACTIVE);
  }

  async deactivateUser(ctx: RequestContext, userId: string): Promise<UserOutput> {
    return this.updateStatus(ctx, userId, UserStatus.INACTIVE);
  }

  async toggleDisableRedeem(_: RequestContext, userId: string): Promise<UserOutput> {
    const user = await this.repository.getById(userId);
    user.disabledRedeem = !user.disabledRedeem;
    await this.repository.save(user);
    return plainToInstanceCustom(UserOutput, user);
  }

  async toggleDisablePurchase(_: RequestContext, userId: string): Promise<UserOutput> {
    const user = await this.repository.getById(userId);
    user.disabledPurchase = !user.disabledPurchase;
    await this.repository.save(user);
    return plainToInstanceCustom(UserOutput, user);
  }
}
