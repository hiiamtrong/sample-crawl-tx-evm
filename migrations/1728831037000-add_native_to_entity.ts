import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNativeToEntity1728831037000 implements MigrationInterface {
    name = 'AddNativeToEntity1728831037000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "is_native" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "decimals" integer NOT NULL DEFAULT '18'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "decimals"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "is_native"
        `);
    }

}
