// TODO: Implement FireblocksService

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy, KafkaContext } from '@nestjs/microservices';
import {
  FIREBLOCKS_MICROSERVICE,
  FireblocksSweepMessage,
  FireblocksWebhookTransaction,
} from 'src/fireblocks/fireblocks.constant';
import { FireblocksVaultRepository } from 'src/fireblocks/repositories/fireblocks-vault.repository';
import { FireblocksCoreService } from 'src/fireblocks/services/fireblocks-core.service';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class FireblocksService {
  constructor(
    private readonly fireblocksCoreService: FireblocksCoreService,
    private readonly fireblocksVaultRepository: FireblocksVaultRepository,
    @Inject(FIREBLOCKS_MICROSERVICE)
    private readonly fireblocksMicroservice: ClientProxy,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(FireblocksService.name);
  }

  async createWebhook(ctx: RequestContext, body: FireblocksWebhookTransaction) {
    this.logger.log(ctx, 'Creating webhook');
    console.log(body);
    // TODO: Implement
  }

  async handleWebhook(
    ctx: RequestContext,
    _: KafkaContext,
    body: FireblocksWebhookTransaction,
  ) {
    this.logger.log(ctx, 'Handling webhook');
    console.log(body);
    // TODO: Implement
  }

  async handleSweepTransaction(
    ctx: RequestContext,
    _: KafkaContext,
    body: FireblocksSweepMessage,
  ) {
    this.logger.log(ctx, 'Handling sweep transaction');
    console.log(body);
    // TODO: Implement
  }

  async createVault(ctx: RequestContext, user: User) {
    const fireblocksVaultName = `vault_${user.email}_${new Date().getTime()}`;

    const fireblocksUser = await this.fireblocksCoreService.createVault(ctx, {
      userId: user.id,
      name: fireblocksVaultName,
    });

    const vault = this.fireblocksVaultRepository
      .create({
        userId: user.id,
        id: fireblocksUser.id,
      });

    await this.fireblocksVaultRepository
      .save(vault);

    return vault;
  }
}
