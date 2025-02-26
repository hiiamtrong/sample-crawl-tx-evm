import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryToCart1731770626136 implements MigrationInterface {
    name = 'AddCountryToCart1731770626136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD "country_id" integer NOT NULL
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
            ALTER TABLE "carts" DROP COLUMN "country_id"
        `);
    }

}
