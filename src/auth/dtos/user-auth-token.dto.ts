import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { UserOutput } from 'src/user/dtos/user-output.dto';

export class UserAuthTokenOutput {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;

  @Expose()
  @ApiProperty()
  @Type(() => UserOutput)
  user: UserOutput;
}

export class UserAccessTokenClaims {
  @Expose()
  id: string;
}

export class UserRefreshTokenClaims {
  id: string;
}
