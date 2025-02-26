import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-local';
import { UserAuthService } from 'src/auth/services/user-auth.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

import { AppLogger } from '../../shared/logger/logger.service';
import { STRATEGY_USER_LOCAL } from '../constants/strategy.constant';

@Injectable()
export class UserLocalStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_USER_LOCAL,
) {
  constructor(
    private readonly logger: AppLogger,
    private readonly userAuthService: UserAuthService,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    });
    this.logger.setContext(UserLocalStrategy.name);
  }

  async validate(req: Request, email: string, password: string) {
    const ctx = RequestContext.fromRequest(req);
    const user = await this.userAuthService.validateUser(ctx, email, password);
    return user;
  }
}
