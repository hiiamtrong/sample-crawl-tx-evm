import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCardUser1727718057719 implements MigrationInterface {
    name = 'UpdateCardUser1727718057719';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."card_users_card_price_currency_enum" AS ENUM('USD')
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "card_price_currency" "public"."card_users_card_price_currency_enum" NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "card_price_currency"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."card_users_card_price_currency_enum"
        `);
    }
}
