import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletType1728636242899 implements MigrationInterface {
    name = 'AddWalletType1728636242899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
            ADD "wallet_type" character varying(255) NOT NULL DEFAULT 'evm'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_wallets" DROP COLUMN "wallet_type"
        `);
    }

}
