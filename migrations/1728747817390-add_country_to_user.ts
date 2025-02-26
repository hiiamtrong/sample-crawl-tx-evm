import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCountryToUser1728747817390 implements MigrationInterface {
    name = 'AddCountryToUser1728747817390'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "country_id" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_ae78dc6cb10aa14cfef96b2dd90" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_ae78dc6cb10aa14cfef96b2dd90"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "country_id"
        `);
    }

}
