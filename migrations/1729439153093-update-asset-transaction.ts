import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateAssetTransaction1729439153093 implements MigrationInterface {
    name = 'UpdateAssetTransaction1729439153093';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" ALTER COLUMN "usd_amount" TYPE numeric(36, 8) USING "usd_amount"::numeric(36, 8)
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" ALTER COLUMN "final_usd_amount" TYPE numeric(36, 8) USING "final_usd_amount"::numeric(36, 8)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "final_usd_amount"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "final_usd_amount" character varying(100)
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "usd_amount"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "usd_amount" character varying(100)
        `);
    }
}
