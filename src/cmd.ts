import './shared/utils/json';

import { CommandFactory } from 'nest-commander';
import { JobModule } from 'src/jobs/job.module';
import { AppLogger } from 'src/shared/logger/logger.service';
import { initializeTransactionalContext, StorageDriver } from 'typeorm-transactional';



async function bootstrap() {
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  await CommandFactory.run(JobModule, new AppLogger());
  process.exit(0);
}

bootstrap();
