import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { AssetTokenService } from 'src/asset-token/asset-token.service';
import { AssetTokenOutputDto } from 'src/asset-token/dtos/asset-token.dto';
import { SwaggerBaseApiResponse } from 'src/shared/dtos/base-api-response.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

@ApiTags('Asset Token')
@Controller('asset-tokens')
export class AssetTokenController {
  constructor(private readonly assetTokenService: AssetTokenService) {}

  @Get()
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([AssetTokenOutputDto]),
  })
  async getAssetTokens(@ReqContext() ctx: RequestContext) {
    return this.assetTokenService.getAssetTokens(ctx);
  }
}
