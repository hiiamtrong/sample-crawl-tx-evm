import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardOrder1727980257186 implements MigrationInterface {
    name = 'AddCardOrder1727980257186'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."card_orders_card_price_currency_enum" AS ENUM('USD')
        `);
        await queryRunner.query(`
            CREATE TABLE "card_orders" (
                "id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "total_price" numeric NOT NULL,
                "card_price_currency" "public"."card_orders_card_price_currency_enum" NOT NULL,
                "purchase_date" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_b7a0d43abfb98e01465f73e66ea" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "card_order"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "card_order_id" bigint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "card_order_number" integer NOT NULL
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."card_users_status_enum" AS ENUM('available', 'redeemed')
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "status" "public"."card_users_status_enum" NOT NULL DEFAULT 'available'
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "discount_percent" numeric NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "redeemed_date" TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "card_price_currency"
            SET DEFAULT 'USD'
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD CONSTRAINT "FK-card_orders-card_users" FOREIGN KEY ("card_order_id") REFERENCES "card_orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD CONSTRAINT "FK-users-card_orders" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP CONSTRAINT "FK-users-card_orders"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP CONSTRAINT "FK-card_orders-card_users"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "card_price_currency" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "redeemed_date"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "discount_percent"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_users_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "card_order_number"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "card_order_id"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "card_order" integer NOT NULL
        `);
        await queryRunner.query(`
            DROP TABLE "card_orders"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_orders_card_price_currency_enum"
        `);
    }

}
