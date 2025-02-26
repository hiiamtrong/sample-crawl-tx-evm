import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { NetworkEnum } from 'src/network/network.constant';
import { Repository } from 'typeorm';

import {
  SystemConfig,
  SystemConfigKey,
} from '../../system-config/entities/system-config.entity';

@Injectable()
export class SystemConfigSeeder {
  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepository: Repository<SystemConfig>,
  ) { }

  async seed() {
    const configs = [
      {
        key: SystemConfigKey.FUND_HOLDER_ACCOUNT,
        value: [
          {
            network: NetworkEnum.ETHEREUM,
            address: '0x4cbF0ae7235258bda0C470Bb7372Ce8ee3D1ec98',
          },
          {
            network: NetworkEnum.BSC,
            address: '0x4cbF0ae7235258bda0C470Bb7372Ce8ee3D1ec98',
          },
          {
            network: NetworkEnum.POLYGON,
            address: '0x4cbF0ae7235258bda0C470Bb7372Ce8ee3D1ec98',
          },
        ],
        description: 'The fund holder account for the platform',
      },
      {
        key: SystemConfigKey.WITHDRAWAL_GAS_FEE_PERCENTAGE,
        value: { value: 10 },
        description: 'The withdrawal gas fee percentage for the platform',
      },
      {
        key: SystemConfigKey.REFERRAL_REWARD_PERCENTAGE,
        value: { value: 10 },
        description: 'The referral reward percentage for the platform',
      },
      {
        key: SystemConfigKey.MIN_SWEEP_AMOUNT_USD,
        value: { value: 50 },
        description: 'The minimum sweep amount in USD for the platform',
      },
      {
        key: SystemConfigKey.MIN_WITHDRAWAL_AMOUNT_USD,
        value: { value: 0.01 },
        description: 'The minimum withdrawal amount in USD for the platform',
      },
      {
        key: SystemConfigKey.MIN_DEPOSIT_AMOUNT_USD,
        value: { value: 0.01 },
        description: 'The minimum deposit amount in USD for the platform',
      },
    ];

    for (const config of configs) {
      const existingConfig = await this.systemConfigRepository.findOne({
        where: { key: config.key },
      });

      const newConfig = this.systemConfigRepository.create(config);
      if (!existingConfig) {
        await this.systemConfigRepository.save(newConfig);
      }
    }
  }
}
