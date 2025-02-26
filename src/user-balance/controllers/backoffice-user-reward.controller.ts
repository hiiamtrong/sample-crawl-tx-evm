import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Permissions } from "src/auth/decorators/permissions.decorator";
import { JwtOperatorAuthGuard } from "src/auth/guards/jwt-operator-auth.guard";
import { USER_PERMISSIONS } from "src/permission/permission.constant";
import { RewardService } from "src/reward/services/reward.service";
import { ReqContext } from "src/shared/request-context/req-context.decorator";
import { RequestContext } from "src/shared/request-context/request-context.dto";
import { AdjustUserRewardDto } from "src/user-balance/dtos/adjust-user-reward.dto";


@Controller('backoffice/user-rewards')
@UseGuards(JwtOperatorAuthGuard)
@ApiTags('Backoffice User Rewards')
@ApiBearerAuth  ()
export class BackofficeUserRewardController {
  constructor(private readonly rewardService: RewardService) { }

  @Post('adjust')
  @Permissions(USER_PERMISSIONS.MANAGE, USER_PERMISSIONS.UPDATE)
  @ApiOperation({ summary: 'Adjust user reward balance' })
  async adjustUserReward(
    @ReqContext() ctx: RequestContext,
    @Body() adjustUserRewardDto: AdjustUserRewardDto,
  ) {
    return this.rewardService.adjustUserReward(
      ctx,
      adjustUserRewardDto,
    );
  }
} 
