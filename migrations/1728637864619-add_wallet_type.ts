import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletType1728637864619 implements MigrationInterface {
    name = 'AddWalletType1728637864619'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "network_type" character varying(50) NOT NULL DEFAULT 'evm'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "network_type"
        `);
    }

}
