import { Command, CommandRunner } from 'nest-commander';

import { Seeder } from './seeder';

@Command({ name: 'seed', description: 'A parameter parse' })
export class SeedCommand extends CommandRunner {
  constructor(private readonly seeder: Seeder) {
    super();
  }

  async run(): Promise<void> {
    console.log('Starting seeding...');
    await this.seeder.seed();
    console.log('Seeding completed');
  }
}
