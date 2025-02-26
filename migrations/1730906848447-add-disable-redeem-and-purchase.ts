import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDisableRedeemAndPurchase1730906848447 implements MigrationInterface {
    name = 'AddDisableRedeemAndPurchase1730906848447'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "disabled_redeem" boolean NOT NULL DEFAULT false
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "disabled_purchase" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "disabled_purchase"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "disabled_redeem"
        `);
    }

}
