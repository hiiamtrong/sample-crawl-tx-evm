import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNativeTokenCoingeckoId1728576574117 implements MigrationInterface {
    name = 'AddNativeTokenCoingeckoId1728576574117'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "native_token_coingecko_id" character varying(50)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "native_token_coingecko_id"
        `);
    }

}
