import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWalletType1728638656777 implements MigrationInterface {
    name = 'AddWalletType1728638656777'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
                RENAME COLUMN "wallet_type" TO "network_type"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets" DROP COLUMN "network_type"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
            ADD "network_type" character varying(50) NOT NULL DEFAULT 'evm'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_wallets" DROP COLUMN "network_type"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
            ADD "network_type" character varying(255) NOT NULL DEFAULT 'evm'
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
                RENAME COLUMN "network_type" TO "wallet_type"
        `);
    }

}
