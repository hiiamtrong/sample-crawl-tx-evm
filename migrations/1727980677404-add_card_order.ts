import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCardOrder1727980677404 implements MigrationInterface {
    name = 'AddCardOrder1727980677404';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "redeem_code" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP COLUMN "card_price_currency"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_orders_card_price_currency_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD "card_price_currency" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "card_price_currency"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_users_card_price_currency_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "card_price_currency" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "card_price_currency"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."card_users_card_price_currency_enum" AS ENUM('USD')
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "card_price_currency" "public"."card_users_card_price_currency_enum" NOT NULL DEFAULT 'USD'
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP COLUMN "card_price_currency"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."card_orders_card_price_currency_enum" AS ENUM('USD')
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD "card_price_currency" "public"."card_orders_card_price_currency_enum" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "redeem_code"
        `);
    }
}
