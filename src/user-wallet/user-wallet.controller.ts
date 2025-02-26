import { Controller, Get, HttpStatus, Param, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { UserWalletAssetTokenOutputDto } from 'src/user-wallet/dtos/user-wallet.dto';
import { UserWalletService } from 'src/user-wallet/user-wallet.service';

@Controller('wallets')
@ApiTags('User/Wallet')
@ApiBearerAuth()
@UseGuards(JwtUserAuthGuard)
export class UserWalletController {
  constructor(private readonly userWalletService: UserWalletService) {}

  @Get(':assetTokenId')
  @ApiOperation({ summary: 'Get user wallet asset token' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User wallet asset token',
    type: UserWalletAssetTokenOutputDto,
  })
  async getUserWallet(
    @ReqContext() ctx: RequestContext,
    @Param('assetTokenId') assetTokenId: string,
  ): Promise<UserWalletAssetTokenOutputDto> {
    return this.userWalletService.getWallet(ctx, ctx.user.id, assetTokenId);
  }
}
