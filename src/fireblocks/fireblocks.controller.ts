import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  FireblocksWebhookTransaction
} from 'src/fireblocks/fireblocks.constant';
import { FireblocksService } from 'src/fireblocks/services/fireblocks.service';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

@Controller('fireblocks')
@ApiTags('Fireblocks')
@ApiBearerAuth()
export class FireblocksController {
  constructor(private readonly fireblocksService: FireblocksService) { }

  @Post('webhook')
  async createWebhook(
    @ReqContext() ctx: RequestContext,
    @Body() body: FireblocksWebhookTransaction,
  ) {
    return this.fireblocksService.createWebhook(ctx, body);
  }
}
