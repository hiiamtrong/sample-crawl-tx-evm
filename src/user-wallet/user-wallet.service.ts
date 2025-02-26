import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';
import { AssetTokenOutputDto } from 'src/asset-token/dtos/asset-token.dto';
import { AssetToken, } from 'src/asset-token/entities/asset-token.entity';
import { AssetTokenRepository } from 'src/asset-token/repositories/asset-token.repository';
import { FireblocksVaultRepository } from 'src/fireblocks/repositories/fireblocks-vault.repository';
import { FireblocksCoreService } from 'src/fireblocks/services/fireblocks-core.service';
import { NetworkTypeEnum } from 'src/network/network.constant';
import { AppConfigService } from 'src/shared/configs/config.service';
import {
  AppExceptionCode,
  getAppException,
} from 'src/shared/exceptions/app.exception';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from 'src/shared/utils/class-transform';
import { encrypt } from 'src/shared/utils/encryption';
import { UserWalletAssetTokenOutputDto, UserWalletOutputDto } from 'src/user-wallet/dtos/user-wallet.dto';
import { UserWallet } from 'src/user-wallet/entities/user-wallet.entity';
import { UserWalletRepository } from 'src/user-wallet/repositories/user-wallet.repository';

@Injectable()
export class UserWalletService {
  constructor(
    private readonly repository: UserWalletRepository,
    private readonly assetTokenRepo: AssetTokenRepository,
    private readonly fireblocksVaultRepo: FireblocksVaultRepository,
    private readonly fireblocksCoreService: FireblocksCoreService,
    private readonly config: AppConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(UserWalletService.name);
  }

  async getUserWalletAssetTokens(_: RequestContext) {
    const assetTokens = await this.assetTokenRepo.find();
    return plainToInstancesCustom(AssetTokenOutputDto, assetTokens);
  }

  async createWallet(
    _: RequestContext,
    userId: string,
    assetToken: AssetToken,
  ) {
    let wallet: UserWallet;
    const networkType = assetToken.networkType;
    if (networkType === NetworkTypeEnum.EVM) {
      const existingWallet = await this.repository.findOne({
        where: { userId, networkType },
      });
      let address: string;
      let privateKey: string;
      let encodedPrivateKey: string;
      if (existingWallet) {
        address = existingWallet.address;
        encodedPrivateKey = existingWallet.privateKey;
      } else {
        const blockchainWallet = ethers.Wallet.createRandom();
        address = blockchainWallet.address;
        privateKey = blockchainWallet.privateKey;

        encodedPrivateKey = await encrypt(
          privateKey,
          this.config.crypto.secret,
          Buffer.from(this.config.crypto.iv, 'hex'),
        );
      }

      wallet = this.repository.create({
        userId,
        address,
        assetTokenId: assetToken.id,
        privateKey: encodedPrivateKey,
      });

      await this.repository.save(wallet);
    }

    return plainToInstanceCustom(UserWalletAssetTokenOutputDto, {
      address: wallet.address,
    });
  }

  async getWallet(ctx: RequestContext, userId: string, assetTokenId: string) {
    const existAssetToken = await this.assetTokenRepo.findOne({
      where: { id: assetTokenId },
    });
    if (!existAssetToken) {
      throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
    }

    const userWallet = await this.repository.findOne({
      where: { userId, assetTokenId },
    });
    if (userWallet)
      return plainToInstanceCustom(UserWalletAssetTokenOutputDto, {
        address: userWallet.address,
      });

    return this.createWallet(ctx, userId, existAssetToken);
  }

  async getUserWalletByAddress(_: RequestContext, address: string, assetTokenId: string) {
    const existAssetToken = await this.assetTokenRepo.findOne({
      where: { id: assetTokenId },
    });

    if (!existAssetToken) {
      throw getAppException(AppExceptionCode.ASSET_TOKEN_NOT_FOUND);
    }

    const userWallet = await this.repository.findOne({
      where: { address, assetTokenId, networkType: existAssetToken.networkType },
    });

    if (!userWallet) {
      const existUserWalletWithSameAddress = await this.repository.findOne({
        where: { address, networkType: existAssetToken.networkType },
      });

      if (existUserWalletWithSameAddress) {
        const newUserWallet = this.repository.create({
          address,
          assetTokenId,
          networkType: existAssetToken.networkType,
          privateKey: existUserWalletWithSameAddress.privateKey,
          userId: existUserWalletWithSameAddress.userId,
        });

        await this.repository.save(newUserWallet);

        return plainToInstanceCustom(UserWalletOutputDto, {
          address: newUserWallet.address,
          userId: newUserWallet.userId,
        });
      } else {
        return null;
      }
    }

    return plainToInstanceCustom(UserWalletOutputDto, {
      address: userWallet.address,
      userId: userWallet.userId,
    });
  }
}
