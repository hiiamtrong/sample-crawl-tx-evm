import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIsHiddenToUser1731729401344 implements MigrationInterface {
    name = 'AddIsHiddenToUser1731729401344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "is_hidden" boolean NOT NULL DEFAULT true
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "is_hidden"
        `);
    }

}
