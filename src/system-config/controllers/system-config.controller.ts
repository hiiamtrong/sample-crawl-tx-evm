import { Controller, Get } from "@nestjs/common";
import { ApiOkResponse, ApiTags } from "@nestjs/swagger";
import { ReqContext } from "src/shared/request-context/req-context.decorator";
import { RequestContext } from "src/shared/request-context/request-context.dto";
import { SystemConfigService } from "src/system-config/services/system-config.service";

@Controller('system-configs')
@ApiTags('System Configs')
export class SystemConfigController {
  constructor(private readonly systemConfigService: SystemConfigService) { }

  @Get('referral-reward-percentage')
  @ApiOkResponse({ type: Number })
  async getReferralRewardPercentage(@ReqContext() ctx: RequestContext): Promise<number> {
    return this.systemConfigService.getReferralRewardPercentage(ctx);
  }
}
