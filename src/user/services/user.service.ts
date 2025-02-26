import { Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import BigNumber from 'bignumber.js';
import { plainToInstance } from 'class-transformer';
import { sumBy } from 'lodash';
import { RewardOutput } from 'src/reward/dtos/reward-output.dto';
import { RewardService } from 'src/reward/services/reward.service';
import { PaginationResponseDto } from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { UserBalanceOutput } from 'src/user-balance/dtos/user-balance-output.dto';
import { UserBalanceService } from 'src/user-balance/services/user-balance.service';
import { UserReferralRepository } from 'src/user-referral/repositories/user-referral.repository';

import {
  AppExceptionCode,
  getAppException,
} from '../../shared/exceptions/app.exception';
import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from '../../shared/utils/class-transform';
import { CreateUserInput } from '../dtos/user-create.dto';
import { UserOutput, UserReferralCodeOutput } from '../dtos/user-output.dto';
import {
  BackofficeUpdateUserInput,
  UpdateUserInput,
} from '../dtos/user-update.dto';
import { User, UserStatus } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private readonly logger: AppLogger,
    private readonly userBalanceService: UserBalanceService,
    private readonly rewardService: RewardService,
    private readonly userReferralRepository: UserReferralRepository,
  ) {
    this.logger.setContext(UserService.name);
  }

  async createUser(
    ctx: RequestContext,
    input: CreateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.createUser.name} was called`);

    const { email, address } = input;
    const condition = email ? { email } : { address };
    const existingUser = await this.userRepository.findOne({
      where: condition,
    });

    if (existingUser) {
      throw getAppException(existingUser.email ? AppExceptionCode.USER_EMAIL_ALREADY_EXISTS : AppExceptionCode.USER_ADDRESS_ALREADY_EXISTS);
    }

    const alias = input.alias;
    if (alias) {
      const existingUserByAlias = await this.userRepository.findOne({
        where: { alias },
      });

      if (existingUserByAlias) {
        throw getAppException(AppExceptionCode.USER_ALIAS_ALREADY_EXISTS);
      }
    }


    const user = plainToInstance(User, input);
    user.password = await hash(input.password, 10);
    user.referralCode = this.generateRandomCode();

    this.logger.log(ctx, `calling ${UserRepository.name}.saveUser`);
    const savedUser = await this.userRepository.create(user);
    await this.userRepository.save(savedUser);

    const referralCode = input.referralCode;
    if (referralCode) {
      const referredByUser = await this.userRepository.findOne({
        where: { referralCode },
      });

      if (referredByUser) {
        const userReferral = this.userReferralRepository.create({
          userId: savedUser.id,
          referredBy: referredByUser.id,
        });
        await this.userReferralRepository.save(userReferral);
      } else {
        throw getAppException(AppExceptionCode.USER_REFERRAL_CODE_NOT_FOUND);
      }
    }

    return plainToInstanceCustom(UserOutput, savedUser);
  }

  async addReferral(_: RequestContext, userId: string, referralCode: string): Promise<void> {
    const existingReferralCode = await this.userReferralRepository.findOne({
      where: { userId },
    });

    if (existingReferralCode) {
      throw getAppException(AppExceptionCode.USER_ALREADY_REFERRED);
    }

    const user = await this.userRepository.getById(userId);
    if (!user.firstLogin) {
      throw getAppException(AppExceptionCode.USER_NOT_FIRST_LOGIN);
    }

    if (user.referralCode === referralCode) {
      throw getAppException(AppExceptionCode.CANNOT_REFER_SELF);
    }

    const referredByUser = await this.userRepository.findOne({
      where: { referralCode },
    });

    if (!referredByUser) {
      throw getAppException(AppExceptionCode.USER_REFERRAL_CODE_NOT_FOUND);
    }

    const userReferral = this.userReferralRepository.create({
      userId,
      referredBy: referredByUser.id,
    });
    await this.userReferralRepository.save(userReferral);
  }



  async validateEmailPassword(
    ctx: RequestContext,
    email: string,
    pass: string,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.validateEmailPassword.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user) throw getAppException(AppExceptionCode.USER_NOT_FOUND);

    const match = await compare(pass, user.password);
    if (!match) throw getAppException(AppExceptionCode.USER_PASSWORD_INCORRECT);

    return plainToInstanceCustom(UserOutput, user);
  }

  async getUsers(
    ctx: RequestContext,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<UserOutput>> {
    const queryRunner = ctx.queryRunner;
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findAndCount`);
    const [users, count] = await this.userRepository
      .createQueryBuilder('user', queryRunner)
      .leftJoinAndSelect('user.country', 'country')
      .skip(pagination.page * pagination.limit)
      .take(pagination.limit)
      .getManyAndCount();

    const usersOutput = plainToInstancesCustom(UserOutput, users);

    return plainToInstanceCustom(PaginationResponseDto<UserOutput>, {
      data: usersOutput,
      total: count,
      page: pagination.page,
    });
  }


  async findById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findById.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['country'],
    });
    return plainToInstanceCustom(UserOutput, user);
  }


  async getUserById(ctx: RequestContext, id: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.getUserById.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
    const user = await this.userRepository.getById(id);

    return plainToInstanceCustom(UserOutput, user);
  }

  async findByEmail(ctx: RequestContext, email: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findByEmail.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
    const user = await this.userRepository
      .findOne({ where: { email } });

    return plainToInstanceCustom(UserOutput, user);
  }

  async findByTempEmail(ctx: RequestContext, tempEmail: string): Promise<UserOutput> {
    this.logger.log(ctx, `${this.findByTempEmail.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.findOne`);
    const user = await this.userRepository.findOne({ where: { tempEmail } });
    return plainToInstanceCustom(UserOutput, user);
  }

  async updateUser(
    ctx: RequestContext,
    userId: string,
    input: UpdateUserInput | BackofficeUpdateUserInput,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateUser.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
    const user = await this.userRepository.getById(userId);

    if (input.email) {
      const emailUser = await this.userRepository.findOne({
        where: { email: input.email },
      });
      if (emailUser && emailUser.id !== userId) {
        throw getAppException(AppExceptionCode.USER_EMAIL_ALREADY_EXISTS);
      }
      user.email = input.email;
    }
    // Hash the password if it exists in the input payload.
    if (input.password) {
      input.password = await hash(input.password, 10);
    }

    // merges the input (2nd line) to the found user (1st line)
    const updatedUser: User = {
      ...user,
      ...plainToInstanceCustom(User, input),
    };

    this.logger.log(ctx, `calling ${UserRepository.name}.save`);
    await this.userRepository
      .createQueryBuilder('user')
      .update()
      .set(updatedUser)
      .where('id = :id', { id: userId })
      .execute();

    return plainToInstanceCustom(UserOutput, updatedUser);
  }

  async updateStatus(
    ctx: RequestContext,
    userId: string,
    status: UserStatus,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.updateStatus.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
    const user = await this.userRepository.getById(userId);

    user.status = status;

    this.logger.log(ctx, `calling ${UserRepository.name}.save`);
    await this.userRepository.save(user);
    return plainToInstanceCustom(UserOutput, user);
  }

  async updateCountry(
    ctx: RequestContext,
    userId: string,
    countryId: number,
  ): Promise<void> {
    this.logger.log(ctx, `${this.updateCountry.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
    const user = await this.userRepository.getById(userId);
    if (user.countryId) {
      if (user.countryId === countryId) {
        return;
      }
    }
    user.countryId = countryId;

    this.logger.log(ctx, `calling ${UserRepository.name}.save`);
    await this.userRepository.save(user);
  }

  async updatePassword(
    ctx: RequestContext,
    userId: string,
    password: string,
  ): Promise<void> {
    this.logger.log(ctx, `${this.updatePassword.name} was called`);

    this.logger.log(ctx, `calling ${UserRepository.name}.getById`);
    const user = await this.userRepository.getById(userId);

    user.password = await hash(password, 10);

    this.logger.log(ctx, `calling ${UserRepository.name}.save`);

    await this.userRepository.save(user);
  }

  async getUserBalance(
    ctx: RequestContext,
    userId: string,
  ): Promise<UserBalanceOutput> {
    this.logger.log(ctx, `${this.getUserBalance.name} was called`);

    const userBalance = await this.userBalanceService.getOrCreateUserBalance(
      ctx,
      userId,
    );
    return plainToInstanceCustom(UserBalanceOutput, userBalance);
  }

  async getUserReward(ctx: RequestContext, userId: string): Promise<RewardOutput> {
    const reward = await this.rewardService.getOrCreateReward(ctx, userId);
    return plainToInstanceCustom(RewardOutput, reward);
  }

  async getUserReferralInfo(ctx: RequestContext, userId: string): Promise<UserReferralCodeOutput> {
    const userReferralCode = await this.getOrCreateReferralCode(ctx, userId);
    // get all referrals of the user where user.status = ACTIVE
    const userReferrals = await this.userReferralRepository.find({
      where: { referredBy: userId, user: { status: UserStatus.ACTIVE } },
    });

    const rewardAmount = sumBy(userReferrals, (userReferral) => new BigNumber(userReferral.rewardAmount).toNumber());

    return plainToInstanceCustom(UserReferralCodeOutput, {
      referralCode: userReferralCode.referralCode,
      rewardAmount: rewardAmount.toString(),
      referralCount: userReferrals.length,
    });
  }

  async getOrCreateReferralCode(_: RequestContext, userId: string): Promise<UserReferralCodeOutput> {
    const user = await this.userRepository.getById(userId);
    if (!user.referralCode) {
      user.referralCode = this.generateRandomCode();
      await this.userRepository.save(user);
    }
    return plainToInstanceCustom(UserReferralCodeOutput, {
      referralCode: user.referralCode,
    });
  }

  private generateRandomCode(): string {
    return Math.random().toString(36).substring(2, 15);
  }

  async findByAddress(_: RequestContext, address: string): Promise<UserOutput> {
    const user = await this.userRepository.findOne({ where: { address } });
    return plainToInstanceCustom(UserOutput, user);
  }

  async updateTempEmail(_: RequestContext, userId: string, tempEmail: string): Promise<void> {
    const user = await this.userRepository.getById(userId);
    user.tempEmail = tempEmail;
    await this.userRepository.save(user);
  }

  async updateEmail(_: RequestContext, userId: string, email: string): Promise<void> {
    const user = await this.userRepository.getById(userId);
    user.email = email;
    await this.userRepository.save(user);
  }

  async updateFirstLogin(_: RequestContext, userId: string, firstLogin: boolean): Promise<void> {
    const user = await this.userRepository.getById(userId);
    user.firstLogin = firstLogin;
    await this.userRepository.save(user);
  }

  async toggleHidden(_: RequestContext, userId: string): Promise<void> {
    const user = await this.userRepository.getById(userId);
    user.isHidden = !user.isHidden;
    if (!user.isHidden) {
      if (!user.alias) {
        throw getAppException(AppExceptionCode.USER_ALIAS_NOT_SET);
      }
    }
    await this.userRepository.save(user);
  }

  async updateAlias(_: RequestContext, userId: string, alias: string): Promise<void> {
    const existingUserByAlias = await this.userRepository.findOne({
      where: { alias },
    });
    if (existingUserByAlias) {
      throw getAppException(AppExceptionCode.USER_ALIAS_ALREADY_EXISTS);
    }
    const user = await this.userRepository.getById(userId);
    user.alias = alias;
    await this.userRepository.save(user);
  }
}
