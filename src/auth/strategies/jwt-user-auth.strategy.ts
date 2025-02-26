import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ROLE } from 'src/auth/constants/role.constant';
import { AppConfigService } from 'src/shared/configs/config.service';
import { AppExceptionCode, getAppException } from 'src/shared/exceptions/app.exception';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import { UserStatus } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/services/user.service';
import { v4 as uuidv4 } from 'uuid';

import {
  AuthStrategyValidationOutput,
  STRATEGY_JWT_USER_AUTH,
} from '../constants/strategy.constant';

@Injectable()
export class JwtUserAuthStrategy extends PassportStrategy(
  Strategy,
  STRATEGY_JWT_USER_AUTH,
) {
  constructor(private readonly config: AppConfigService, private readonly userService: UserService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.jwt.publicKey,
      algorithms: ['RS256'],
    });
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  async validate(payload: any): Promise<AuthStrategyValidationOutput> {
    // Passport automatically creates a user object, based on the value we return from the validate() method,
    // and assigns it to the Request object as req.user
    const ctx = new RequestContext({
      requestID: uuidv4(),
    })

    const user = await this.userService.findById(ctx, payload.sub);
    if (!user) {
      throw getAppException(AppExceptionCode.AUTH_INVALID_CREDENTIALS);
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw getAppException(AppExceptionCode.USER_NOT_ACTIVE);
    }

    return {
      id: payload.sub,
      role: ROLE.USER,
      permissions: new Set(),
    };
  }
}
