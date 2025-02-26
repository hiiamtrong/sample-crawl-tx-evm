import './shared/utils/json';

import { CommandFactory } from 'nest-commander';
import { SeederModule } from 'src/database/seeders/seeder.module';
import { AppLogger } from 'src/shared/logger/logger.service';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';



async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  await CommandFactory.run(SeederModule, new AppLogger());
  process.exit(0);
}

bootstrap();
