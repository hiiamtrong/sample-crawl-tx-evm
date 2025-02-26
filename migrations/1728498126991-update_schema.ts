import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSchema1728498126991 implements MigrationInterface {
    name = 'UpdateSchema1728498126991'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_balances"
            ALTER COLUMN "amount" TYPE numeric(36, 8)
        `);
        await queryRunner.query(`
            ALTER TABLE "user_balances"
            ALTER COLUMN "locked_amount" TYPE numeric(36, 8)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_balances"
            ALTER COLUMN "locked_amount" TYPE numeric(18, 8)
        `);
        await queryRunner.query(`
            ALTER TABLE "user_balances"
            ALTER COLUMN "amount" TYPE numeric(18, 8)
        `);
    }

}
