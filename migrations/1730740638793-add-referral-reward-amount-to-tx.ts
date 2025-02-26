import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferralRewardAmountToTx1730740638793 implements MigrationInterface {
    name = 'AddReferralRewardAmountToTx1730740638793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "referralRewardAmount" character varying(100) NOT NULL DEFAULT '0'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "referralRewardAmount"
        `);
    }

}
