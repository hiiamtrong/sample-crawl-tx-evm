import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { OperatorAuthController } from 'src/auth/controllers/operator-auth.controller';
import { OperatorAuthService } from 'src/auth/services/operator-auth.service';
import { JwtOperatorAuthStrategy } from 'src/auth/strategies/jwt-operator-auth.strategy';
import { JwtOperatorRefreshStrategy } from 'src/auth/strategies/jwt-operator-refresh.strategy';
import { OperatorLocalStrategy } from 'src/auth/strategies/operator-local.strategy';
import { FirebaseModule } from 'src/firebase/firebase.module';
import { OperatorModule } from 'src/operator/operator.module';
import { OtpModule } from 'src/otp/otp.module';
import { PermissionModule } from 'src/permission/permission.module';
import { AppConfigService } from 'src/shared/configs/config.service';

import { UserModule } from '../user/user.module';
import { UserAuthController } from './controllers/user-auth.controller';
import { UserAuthService } from './services/user-auth.service';
import { JwtUserAuthStrategy } from './strategies/jwt-user-auth.strategy';
import { JwtUserRefreshStrategy } from './strategies/jwt-user-refresh.strategy';
import { UserLocalStrategy } from './strategies/user-local.strategy';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: async (config: AppConfigService) => ({
        publicKey: config.jwt.publicKey,
        privateKey: config.jwt.privateKey,
        signOptions: {
          algorithm: 'RS256',
        },
      }),
      inject: [AppConfigService],
    }),
    FirebaseModule,
    UserModule,
    OperatorModule,
    PermissionModule,
    OtpModule,
  ],
  controllers: [UserAuthController, OperatorAuthController],
  providers: [
    UserLocalStrategy,
    OperatorLocalStrategy,
    JwtUserAuthStrategy,
    JwtUserRefreshStrategy,
    JwtOperatorAuthStrategy,
    JwtOperatorRefreshStrategy,
    UserAuthService,
    OperatorAuthService,
  ],
})
export class AuthModule { }
