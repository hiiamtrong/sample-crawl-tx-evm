import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferralBy1729882302833 implements MigrationInterface {
    name = 'AddReferralBy1729882302833'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "referred_by" bigint
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_cae1425350da39cb85345115cbb" FOREIGN KEY ("referred_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_cae1425350da39cb85345115cbb"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "referred_by"
        `);
    }

}
