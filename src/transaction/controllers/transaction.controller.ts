import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtUserAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import {
  PaginationResponseDto,
  SwaggerBaseApiResponse,
} from 'src/shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from 'src/shared/dtos/pagination-params.dto';
import { ReqContext } from 'src/shared/request-context/req-context.decorator';
import { RequestContext } from 'src/shared/request-context/request-context.dto';
import {
  AssetTransactionFilterDto,
  AssetTransactionOutputDto,
} from 'src/transaction/dtos/asset-transaction.dto';
import {
  EstimateFeeInputDto,
  EstimateFeeOutputDto,
  WithdrawInputDto,
  WithdrawOutputDto,
} from 'src/transaction/dtos/withdraw.dto';
import { TransactionService } from 'src/transaction/services/transaction.service';


@Controller('transaction')
@ApiTags('User Transaction')
@ApiBearerAuth()
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) { }

  @UseGuards(JwtUserAuthGuard)
  @Get('/my-transactions')
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([AssetTransactionOutputDto]),
  })
  async myOrders(
    @ReqContext() ctx: RequestContext,
    @Query() pagination: PaginationParamsDto,
    @Query() filter: AssetTransactionFilterDto,
  ): Promise<PaginationResponseDto<AssetTransactionOutputDto>> {
    return this.transactionService.myTransactions(ctx, filter, pagination);
  }

  @UseGuards(JwtUserAuthGuard)
  @Post('/withdraw')
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(WithdrawOutputDto),
  })
  async withdraw(
    @ReqContext() ctx: RequestContext,
    @Body() body: WithdrawInputDto,
  ): Promise<WithdrawOutputDto> {
    return this.transactionService.withdraw(ctx, body);
  }

  @UseGuards(JwtUserAuthGuard)
  @Post('/withdraw/estimate')
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(EstimateFeeOutputDto),
  })
  async estimateWithdraw(
    @ReqContext() ctx: RequestContext,
    @Body() body: EstimateFeeInputDto,
  ): Promise<EstimateFeeOutputDto> {
    return this.transactionService.estimateWithdraw(ctx, body);
  }
}
