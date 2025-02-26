import { Injectable } from '@nestjs/common';
import { AssetTokenOutputDto } from 'src/asset-token/dtos/asset-token.dto';
import { AssetTokenRepository } from 'src/asset-token/repositories/asset-token.repository';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { plainToInstancesCustom } from 'src/shared/utils/class-transform';

@Injectable()
export class AssetTokenService {
  constructor(private readonly assetTokenRepository: AssetTokenRepository) { }

  async getAssetTokens(_: RequestContext) {
    const assetTokens = await this.assetTokenRepository.find();
    return plainToInstancesCustom(AssetTokenOutputDto, assetTokens);
  }
}
