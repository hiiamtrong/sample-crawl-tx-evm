import { Injectable } from '@nestjs/common';
import { FAQOutputDto } from 'src/faq/dtos/faq.dto';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

import { PaginationResponseDto } from '../../shared/dtos/base-api-response.dto';
import { PaginationParamsDto } from '../../shared/dtos/pagination-params.dto';
import {
  plainToInstanceCustom,
  plainToInstancesCustom,
} from '../../shared/utils/class-transform';
import { CreateFAQDto, UpdateFAQDto } from '../dtos/faq.dto';
import { FAQRepository } from '../repositories/faq.repository';

@Injectable()
export class BackofficeFAQService {
  constructor(private readonly faqRepository: FAQRepository) { }

  async create(
    _: RequestContext,
    createFAQDto: CreateFAQDto,
  ): Promise<FAQOutputDto> {
    const faq = this.faqRepository.create(createFAQDto);
    await this.faqRepository.save(faq);
    return plainToInstanceCustom(FAQOutputDto, faq);
  }

  async findAll(
    _: RequestContext,
    pagination: PaginationParamsDto,
  ): Promise<PaginationResponseDto<FAQOutputDto>> {
    const [faqs, total] = await this.faqRepository

      .findAndCount({
        skip: pagination.page * pagination.limit,
        take: pagination.limit,
        order: { createdAt: 'DESC' },
      });
    console.log({
      faqs,
      total,
      page: pagination.page,
    });

    return plainToInstanceCustom(PaginationResponseDto<FAQOutputDto>, {
      data: plainToInstancesCustom(FAQOutputDto, faqs),
      total,
      page: pagination.page,
    });
  }

  async findOne(_: RequestContext, id: string): Promise<FAQOutputDto> {
    const faq = await this.faqRepository.findOneOrFail({
      where: { id },
    });
    return plainToInstanceCustom(FAQOutputDto, faq);
  }

  async update(
    ctx: RequestContext,
    id: string,
    updateFAQDto: UpdateFAQDto,
  ): Promise<FAQOutputDto> {
    await this.faqRepository.update(id, updateFAQDto);
    return this.findOne(ctx, id);
  }

  async remove(_: RequestContext, id: string): Promise<void> {
    await this.faqRepository.delete(id);
  }
}
