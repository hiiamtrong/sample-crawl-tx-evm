import { InjectRepository } from '@nestjs/typeorm';
import { get } from 'lodash';
import { NetworkEnum } from 'src/network/network.constant';
import { OperatorService } from 'src/operator/operator.service';
import { OtpService } from 'src/otp/otp.service';
import {
  AppExceptionCode,
  getAppException,
} from 'src/shared/exceptions/app.exception';
import { Repository } from 'typeorm';

import { AppLogger } from '../../shared/logger/logger.service';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from '../../shared/utils/class-transform';
import { CreateSystemConfigDto } from '../dtos/create-system-config.dto';
import {
  SystemConfigFundHolderAccountOutputDto,
  SystemConfigOutputDto,
} from '../dtos/system-config-output.dto';
import {
  UpdateFundHolderAccountDto,
  UpdateMinDepositAmountUsd,
  UpdateMinSweepAmountUSD,
  UpdateMinWithdrawalAmountUsd,
  UpdateReferralRewardPercentageDto,
  UpdateWithdrawalFeeRateDto,
} from '../dtos/update-system-config.dto';
import {
  SystemConfig,
  SystemConfigKey,
} from '../entities/system-config.entity';

export class SystemConfigService {
  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
    private readonly logger: AppLogger,
    private readonly otpService: OtpService,
    private readonly operatorService: OperatorService,
  ) {
    this.logger.setContext(SystemConfigService.name);
  }

  async findAll(ctx: RequestContext): Promise<SystemConfigOutputDto[]> {
    this.logger.log(ctx, `${this.findAll.name} was called`);
    const configs = await this.systemConfigRepository.find();
    return plainToInstancesCustom(SystemConfigOutputDto, configs);
  }

  async findOne(
    ctx: RequestContext,
    key: SystemConfigKey,
  ): Promise<SystemConfigOutputDto> {
    this.logger.log(ctx, `${this.findOne.name} was called`);
    const config = await this.systemConfigRepository.findOne({
      where: { key },
    });
    return plainToInstanceCustom(SystemConfigOutputDto, config);
  }

  async create(
    ctx: RequestContext,
    createDto: CreateSystemConfigDto,
  ): Promise<SystemConfigOutputDto> {
    this.logger.log(ctx, `${this.create.name} was called`);
    const config = this.systemConfigRepository.create(createDto);
    const savedConfig = await this.systemConfigRepository.save(config);
    return plainToInstanceCustom(SystemConfigOutputDto, savedConfig);
  }

  async delete(ctx: RequestContext, id: string): Promise<void> {
    this.logger.log(ctx, `${this.delete.name} was called`);
    await this.systemConfigRepository.delete(id);
  }

  async findById(
    ctx: RequestContext,
    id: string,
  ): Promise<SystemConfigOutputDto> {
    this.logger.log(ctx, `${this.findById.name} was called`);
    const config = await this.systemConfigRepository.findOne({ where: { id } });
    return plainToInstanceCustom(SystemConfigOutputDto, config);
  }

  async getWithdrawalFeeRate(ctx: RequestContext): Promise<number> {
    const config = await this.findOne(
      ctx,
      SystemConfigKey.WITHDRAWAL_GAS_FEE_PERCENTAGE,
    );

    const percentage = get(config, 'value.value', 0);
    return percentage;
  }

  async updateWithdrawalFeeRate(
    ctx: RequestContext,
    updateDto: UpdateWithdrawalFeeRateDto,
  ): Promise<SystemConfigOutputDto> {
    const config = await this.findOne(
      ctx,
      SystemConfigKey.WITHDRAWAL_GAS_FEE_PERCENTAGE,
    );
    config.value = {
      value: updateDto.value,
    };
    return this.systemConfigRepository.save(config);
  }

  async getReferralRewardPercentage(ctx: RequestContext): Promise<number> {
    const config = await this.findOne(
      ctx,
      SystemConfigKey.REFERRAL_REWARD_PERCENTAGE,
    );
    const percentage = get(config, 'value.value', 0);
    return percentage;
  }

  async updateReferralRewardPercentage(
    ctx: RequestContext,
    updateDto: UpdateReferralRewardPercentageDto,
  ): Promise<SystemConfigOutputDto> {
    const config = await this.findOne(
      ctx,
      SystemConfigKey.REFERRAL_REWARD_PERCENTAGE,
    );

    config.value = {
      value: updateDto.value,
    };
    return this.systemConfigRepository.save(config);
  }

  async getFundHolderAccount(
    ctx: RequestContext,
  ): Promise<SystemConfigFundHolderAccountOutputDto[]> {
    const config = await this.findOne(ctx, SystemConfigKey.FUND_HOLDER_ACCOUNT);
    return plainToInstancesCustom(
      SystemConfigFundHolderAccountOutputDto,
      config.value as SystemConfigFundHolderAccountOutputDto[],
    );
  }

  async requestUpdateFundHolderAccount(
    ctx: RequestContext,
    network: NetworkEnum,
  ): Promise<{ success: boolean }> {
    const operator = await this.operatorService.findById(ctx, ctx.user.id);
    await this.otpService.sendEmailOtp(
      operator.email,
      'system-config-fund-holder-account-request',
      { network },
    );
    return { success: true };
  }

  async updateFundHolderAccount(
    ctx: RequestContext,
    network: NetworkEnum,
    updateDto: UpdateFundHolderAccountDto,
  ): Promise<SystemConfigOutputDto> {
    const config = await this.findOne(ctx, SystemConfigKey.FUND_HOLDER_ACCOUNT);
    const { otp } = updateDto;
    const operator = await this.operatorService.findById(ctx, ctx.user.id);
    const isValidOtp = await this.otpService.verifyEmailOtp(
      operator.email,
      otp,
      'system-config-fund-holder-account-request',
    );
    if (!isValidOtp) {
      throw getAppException(AppExceptionCode.OPERATOR_OTP_INCORRECT);
    }

    const fundHolderAccountConfig: SystemConfigFundHolderAccountOutputDto[] =
      config.value as SystemConfigFundHolderAccountOutputDto[];
    const networkIndex = fundHolderAccountConfig.findIndex(
      (item) => item.network === network,
    );
    if (networkIndex === -1) {
      throw getAppException(AppExceptionCode.SYSTEM_CONFIG_NOT_FOUND);
    }

    fundHolderAccountConfig[networkIndex].address = updateDto.address;

    config.value = fundHolderAccountConfig;

    await this.otpService.clearEmailOtp(
      operator.email,
      'system-config-fund-holder-account-request',
    );
    return this.systemConfigRepository.save(config);
  }

  async getMinSweepAmountUSD(ctx: RequestContext): Promise<number> {
    const config = await this.findOne(ctx, SystemConfigKey.MIN_SWEEP_AMOUNT_USD);
    const amount = get(config, 'value.value', 0);
    return amount;
  }

  async updateMinSweepAmountUSD(
    ctx: RequestContext,
    updateDto: UpdateMinSweepAmountUSD,
  ): Promise<SystemConfigOutputDto> {
    const config = await this.findOne(ctx, SystemConfigKey.MIN_SWEEP_AMOUNT_USD);
    config.value = {
      value: updateDto.value,
    };
    return this.systemConfigRepository.save(config);
  }

  async getMinDepositAmountUsd(ctx: RequestContext): Promise<number> {
    const config = await this.findOne(ctx, SystemConfigKey.MIN_DEPOSIT_AMOUNT_USD);
    const amount = get(config, 'value.value', 0);
    return amount;
  }

  async updateMinDepositAmountUsd(
    ctx: RequestContext,
    updateDto: UpdateMinDepositAmountUsd,
  ): Promise<SystemConfigOutputDto> {
    const config = await this.findOne(ctx, SystemConfigKey.MIN_DEPOSIT_AMOUNT_USD);
    config.value = { value: updateDto.value };
    return this.systemConfigRepository.save(config);
  }

  async getMinWithdrawalAmountUsd(ctx: RequestContext): Promise<number> {
    const config = await this.findOne(ctx, SystemConfigKey.MIN_WITHDRAWAL_AMOUNT_USD);
    const amount = get(config, 'value.value', 0);
    return amount;
  }

  async updateMinWithdrawalAmountUsd(
    ctx: RequestContext,
    updateDto: UpdateMinWithdrawalAmountUsd,
  ): Promise<SystemConfigOutputDto> {
    const config = await this.findOne(ctx, SystemConfigKey.MIN_WITHDRAWAL_AMOUNT_USD);
    config.value = { value: updateDto.value };
    return this.systemConfigRepository.save(config);
  }
}
