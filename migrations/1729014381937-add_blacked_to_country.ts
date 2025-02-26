import { MigrationInterface, QueryRunner } from "typeorm";

export class AddBlackedToCountry1729014381937 implements MigrationInterface {
    name = 'AddBlackedToCountry1729014381937'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "countries"
            ADD "blacklisted" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "countries" DROP COLUMN "blacklisted"
        `);
    }

}
