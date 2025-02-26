import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFinalUsdAmount1728705956277 implements MigrationInterface {
    name = 'AddFinalUsdAmount1728705956277'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "network_fee_usd_amount" character varying NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "final_usd_amount" character varying(100)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "final_usd_amount"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "network_fee_usd_amount"
        `);
    }

}
