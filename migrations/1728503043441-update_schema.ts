import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchema1728503043441 implements MigrationInterface {
    name = 'UpdateSchema1728503043441';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."user_fireblocks_asset_idx"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
                RENAME COLUMN "fireblocks_wallet_id" TO "private_key"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets" DROP COLUMN "private_key"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
            ADD "private_key" text NOT NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "user_fireblocks_asset_idx" ON "user_wallets" ("user_id", "asset_token_id")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX "public"."user_fireblocks_asset_idx"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets" DROP COLUMN "private_key"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
            ADD "private_key" character varying(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
                RENAME COLUMN "private_key" TO "fireblocks_wallet_id"
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "user_fireblocks_asset_idx" ON "user_wallets" ("user_id", "fireblocks_wallet_id")
        `);
    }
}
