import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchema1728496660701 implements MigrationInterface {
    name = 'UpdateSchema1728496660701';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "fireblocksId"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "fireblocks_tx_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "fail_reason"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "contract_address" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "chain_id" character varying(50) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "chain_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "contract_address"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "fail_reason" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "fireblocks_tx_id" character varying(100) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "fireblocksId" character varying(50) NOT NULL
        `);
    }
}
