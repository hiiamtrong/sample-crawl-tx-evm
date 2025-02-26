import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FAQ_PERMISSIONS } from 'src/permission/permission.constant';

import { Permissions } from '../../auth/decorators/permissions.decorator';
import { JwtOperatorAuthGuard } from '../../auth/guards/jwt-operator-auth.guard';
import { SwaggerBaseApiResponse } from '../../shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';
import { ReqContext } from '../../shared/request-context/req-context.decorator';
import { RequestContext } from '../../shared/request-context/request-context.dto';
import { CreateFAQDto, FAQOutputDto, UpdateFAQDto } from '../dtos/faq.dto';
import { BackofficeFAQService } from '../services/backoffice-faq.service';

@ApiBearerAuth()
@ApiTags('Backoffice/FAQ')
@Controller('backoffice/faq')
@UseGuards(JwtOperatorAuthGuard)
export class BackofficeFAQController {
  constructor(private readonly backofficeFAQService: BackofficeFAQService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new FAQ' })
  @ApiResponse({
    status: 201,
    type: SwaggerBaseApiResponse(FAQOutputDto),
  })
  @Permissions(FAQ_PERMISSIONS.CREATE, FAQ_PERMISSIONS.MANAGE)
  async create(
    @ReqContext() ctx: RequestContext,
    @Body() createFAQDto: CreateFAQDto,
  ) {
    return this.backofficeFAQService.create(ctx, createFAQDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all FAQs' })
  @ApiResponse({
    status: 200,
    type: SwaggerBaseApiResponse([FAQOutputDto]),
  })
  @Permissions(FAQ_PERMISSIONS.READ, FAQ_PERMISSIONS.MANAGE)
  async findAll(
    @ReqContext() ctx: RequestContext,
    @Query() pagination: PaginationParamsDto,
  ) {
    return this.backofficeFAQService.findAll(ctx, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a FAQ by id' })
  @ApiResponse({
    status: 200,
    type: SwaggerBaseApiResponse(FAQOutputDto),
  })
  @Permissions(FAQ_PERMISSIONS.READ, FAQ_PERMISSIONS.MANAGE)
  async findOne(@ReqContext() ctx: RequestContext, @Param('id') id: string) {
    return this.backofficeFAQService.findOne(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a FAQ' })
  @ApiResponse({
    status: 200,
    type: SwaggerBaseApiResponse(FAQOutputDto),
  })
  @Permissions(FAQ_PERMISSIONS.UPDATE, FAQ_PERMISSIONS.MANAGE)
  async update(
    @ReqContext() ctx: RequestContext,
    @Param('id') id: string,
    @Body() updateFAQDto: UpdateFAQDto,
  ) {
    return this.backofficeFAQService.update(ctx, id, updateFAQDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a FAQ' })
  @ApiResponse({
    status: 200,
    type: SwaggerBaseApiResponse(Boolean),
  })
  @Permissions(FAQ_PERMISSIONS.DELETE, FAQ_PERMISSIONS.MANAGE)
  async remove(@ReqContext() ctx: RequestContext, @Param('id') id: string) {
    await this.backofficeFAQService.remove(ctx, id);
    return true;
  }
}
