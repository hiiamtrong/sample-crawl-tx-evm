import { Request } from 'express';
import { AuthStrategyValidationOutput } from 'src/auth/constants/strategy.constant';
import { REQUEST_ID_TOKEN_HEADER } from 'src/shared/constants';
import { QueryRunner } from 'typeorm';

export class RequestContext {
  public requestID: string;

  public url: string;

  public ip: string;

  public user: AuthStrategyValidationOutput;

  public queryRunner?: QueryRunner;

  public pagination: {
    total: number;
    page: number;
  };

  public timezone: string;

  constructor(params: { requestID: string; }) {
    this.requestID = params.requestID;
  }

  static fromRequest(req: Request): RequestContext {
    console.log(req)
    const requestID = req.headers[REQUEST_ID_TOKEN_HEADER] as string;
    return new RequestContext({ requestID });
  }
}
