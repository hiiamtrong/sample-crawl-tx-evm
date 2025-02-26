import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFeeDecimal1730355552497 implements MigrationInterface {
    name = 'AddFeeDecimal1730355552497'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens"
            ADD "fee_decimals" integer NOT NULL DEFAULT '18'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_tokens" DROP COLUMN "fee_decimals"
        `);
    }

}
