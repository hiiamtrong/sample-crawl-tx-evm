import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateBaseEntity1726977847204 implements MigrationInterface {
    name = 'UpdateBaseEntity1726977847204';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "created_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD "created_by" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "updated_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD "updated_by" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "deleted_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD "deleted_by" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "deleted_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD "deleted_by" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "updated_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD "updated_by" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "created_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD "created_by" integer NOT NULL
        `);
    }
}
