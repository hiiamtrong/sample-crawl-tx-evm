import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAddressToUser1730736517436 implements MigrationInterface {
    name = 'AddAddressToUser1730736517436'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "address" character varying(200)
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_b0ec0293d53a1385955f9834d5c" UNIQUE ("address")
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "email" DROP NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ALTER COLUMN "email"
            SET NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_b0ec0293d53a1385955f9834d5c"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "address"
        `);
    }

}
