import { Injectable } from '@nestjs/common';
import { ROLE } from 'src/auth/constants/role.constant';
import {
  CARD_PERMISSIONS,
  COUNTRY_PERMISSIONS,
  FAQ_PERMISSIONS,
  REFERRAL_PERMISSIONS,
  SYSTEM_CONFIG_PERMISSIONS,
  TRANSACTION_PERMISSIONS,
  USER_PERMISSIONS,
} from 'src/permission/permission.constant';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
@Injectable()
export class PermissionService {
  private readonly logger: AppLogger;
  constructor() {
    this.logger = new AppLogger();
    this.logger.setContext(PermissionService.name);
  }

  async getOperatorPermissions(ctx: RequestContext, operatorId: string) {
    // This is a dummy implementation. In a real-world application, you would fetch the permissions from a database.
    // Todo: Implement a real-world permission system.
    this.logger.log(ctx, `Fetching permissions for operator ${operatorId}`);
    const role = ROLE.ADMIN;
    const permissions = new Set([
      USER_PERMISSIONS.MANAGE,
      SYSTEM_CONFIG_PERMISSIONS.MANAGE,
      CARD_PERMISSIONS.MANAGE,
      COUNTRY_PERMISSIONS.MANAGE,
      TRANSACTION_PERMISSIONS.MANAGE,
      FAQ_PERMISSIONS.MANAGE,
      REFERRAL_PERMISSIONS.MANAGE,
    ]);

    return { role, permissions };
  }
}
