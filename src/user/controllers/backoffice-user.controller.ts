import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Permissions } from 'src/auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from 'src/auth/guards/jwt-operator-auth.guard';
import { USER_PERMISSIONS } from 'src/permission/permission.constant';

import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import {
  BaseApiErrorResponse,
  PaginationResponseDto,
  SwaggerBaseApiResponse,
} from '../../shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';
import { AppLogger } from '../../shared/logger/logger.service';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { BackofficeUserFilterDto } from '../dtos/backoffice-user.dto';
import { UserOutput } from '../dtos/user-output.dto';
import { BackofficeUserService } from '../services/backoffice-user.service';

@ApiBearerAuth()
@ApiTags('Backoffice/Users')
@Controller('backoffice/users')
@UseGuards(JwtOperatorAuthGuard, PermissionsGuard)
export class BackOfficeUserController {
  constructor(
    private readonly backofficeUserService: BackofficeUserService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(BackOfficeUserController.name);
  }

  @UseInterceptors(ClassSerializerInterceptor)
  @Get()
  @ApiOperation({
    summary: 'Get users as a list API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse([UserOutput]),
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    type: BaseApiErrorResponse,
  })
  @Permissions(USER_PERMISSIONS.MANAGE, USER_PERMISSIONS.READ)
  async getUsers(
    @ReqContext() ctx: RequestContext,
    @Query() pagination: PaginationParamsDto,
    @Query() filter: BackofficeUserFilterDto,
  ): Promise<PaginationResponseDto<UserOutput>> {
    this.logger.log(ctx, `${this.getUsers.name} was called`);

    const result = await this.backofficeUserService.getUsers(
      ctx,
      filter,
      pagination,
    );

    return result;
  }

  @Permissions(USER_PERMISSIONS.MANAGE, USER_PERMISSIONS.READ)
  @UseInterceptors(ClassSerializerInterceptor)
  @Get(':id')
  @ApiOperation({
    summary: 'Get user by id API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  async getUser(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.getUser.name} was called`);

    const user = await this.backofficeUserService.getUserById(ctx, id);
    return user;
  }

  @Patch(':id/activate')
  @ApiOperation({
    summary: 'Update user API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    type: BaseApiErrorResponse,
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Permissions(USER_PERMISSIONS.MANAGE, USER_PERMISSIONS.UPDATE)
  async activeUser(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: string,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.activeUser.name} was called`);

    const user = await this.backofficeUserService.activateUser(ctx, userId);
    return user;
  }

  @Patch(':id/deactivate')
  @ApiOperation({
    summary: 'Deactivate user API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Permissions(USER_PERMISSIONS.MANAGE, USER_PERMISSIONS.UPDATE)
  async deactivateUser(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: string,
  ): Promise<UserOutput> {
    this.logger.log(ctx, `${this.deactivateUser.name} was called`);

    const user = await this.backofficeUserService.deactivateUser(ctx, userId);
    return user;
  }

  @Patch(':id/toggle-disable-redeem')
  @ApiOperation({
    summary: 'Toggle disable redeem API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Permissions(USER_PERMISSIONS.MANAGE, USER_PERMISSIONS.UPDATE)
  async toggleDisableRedeem(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: string,
  ): Promise<UserOutput> {
    return this.backofficeUserService.toggleDisableRedeem(ctx, userId);
  }

  @Patch(':id/toggle-disable-purchase')
  @ApiOperation({
    summary: 'Toggle disable purchase API',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: SwaggerBaseApiResponse(UserOutput),
  })
  @UseInterceptors(ClassSerializerInterceptor)
  @Permissions(USER_PERMISSIONS.MANAGE, USER_PERMISSIONS.UPDATE)
  async toggleDisablePurchase(
    @ReqContext() ctx: RequestContext,
    @Param('id') userId: string,
  ): Promise<UserOutput> {
    return this.backofficeUserService.toggleDisablePurchase(ctx, userId);
  }
}
