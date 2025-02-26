import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountry1728102497079 implements MigrationInterface {
    name = 'AddCountry1728102497079';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD "country_id" integer NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "country_currencies" DROP CONSTRAINT "FK-countries-countries_currencies"
        `);
        await queryRunner.query(`
            ALTER TABLE "country_currencies"
            ALTER COLUMN "country_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "country_currencies"
            ADD CONSTRAINT "FK-countries-countries_currencies" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD CONSTRAINT "FK-countries-card_orders" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP CONSTRAINT "FK-countries-card_orders"
        `);
        await queryRunner.query(`
            ALTER TABLE "country_currencies" DROP CONSTRAINT "FK-countries-countries_currencies"
        `);
        await queryRunner.query(`
            ALTER TABLE "country_currencies"
            ALTER COLUMN "country_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "country_currencies"
            ADD CONSTRAINT "FK-countries-countries_currencies" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP COLUMN "country_id"
        `);
    }
}
