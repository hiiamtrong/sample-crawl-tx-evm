import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTotalDiscountAmount1728755812885 implements MigrationInterface {
    name = 'AddTotalDiscountAmount1728755812885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD "total_discount_amount" numeric NOT NULL DEFAULT '0'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP COLUMN "total_discount_amount"
        `);
    }

}
