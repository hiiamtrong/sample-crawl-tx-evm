import { MigrationInterface, QueryRunner } from "typeorm";

export class AllowCountryIsNullable1732715075109 implements MigrationInterface {
    name = 'AllowCountryIsNullable1732715075109'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK-countries-carts"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ALTER COLUMN "country_id" DROP NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK-countries-carts" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK-countries-carts"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ALTER COLUMN "country_id"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK-countries-carts" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
