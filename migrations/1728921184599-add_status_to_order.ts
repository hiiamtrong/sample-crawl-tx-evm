import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusToOrder1728921184599 implements MigrationInterface {
    name = 'AddStatusToOrder1728921184599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."card_orders_status_enum" AS ENUM('refunded', 'completed')
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD "status" "public"."card_orders_status_enum" NOT NULL DEFAULT 'completed'
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."card_users_status_enum"
            RENAME TO "card_users_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."card_users_status_enum" AS ENUM('available', 'redeemed', 'refunded')
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "status" TYPE "public"."card_users_status_enum" USING "status"::"text"::"public"."card_users_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "status"
            SET DEFAULT 'available'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_users_status_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."card_users_status_enum_old" AS ENUM('available', 'redeemed')
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "status" TYPE "public"."card_users_status_enum_old" USING "status"::"text"::"public"."card_users_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ALTER COLUMN "status"
            SET DEFAULT 'available'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_users_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."card_users_status_enum_old"
            RENAME TO "card_users_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP COLUMN "status"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_orders_status_enum"
        `);
    }

}
