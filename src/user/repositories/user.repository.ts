import { Injectable } from '@nestjs/common';
import { AppExceptionCode, getAppException } from 'src/shared/exceptions/app.exception';
import { DataSource, Repository } from 'typeorm';

import { User } from '../entities/user.entity';


@Injectable()
export class UserRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async getById(id: string): Promise<User> {
    const user = await this.findOneBy({ id });
    if (!user) {
      throw getAppException(AppExceptionCode.USER_NOT_FOUND);
    }

    return user;
  }
}
