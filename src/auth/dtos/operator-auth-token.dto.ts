import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { OperatorOutput } from 'src/operator/dtos/operator.dto';

export class OperatorAuthTokenOutput {
  @Expose()
  @ApiProperty()
  accessToken: string;

  @Expose()
  @ApiProperty()
  refreshToken: string;

  @Expose()
  @ApiProperty()
  @Type(() => OperatorOutput)
  operator: OperatorOutput;
}

export class OperatorAccessTokenClaims {
  @Expose()
  id: string;

}

export class OperatorRefreshTokenClaims {
  id: string;
}
