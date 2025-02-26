import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFailReasonToTx1728906907949 implements MigrationInterface {
    name = 'AddFailReasonToTx1728906907949'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "failed_reason" text
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "failed_reason"
        `);
    }

}
