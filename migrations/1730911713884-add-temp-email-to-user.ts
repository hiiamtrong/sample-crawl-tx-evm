import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTempEmailToUser1730911713884 implements MigrationInterface {
    name = 'AddTempEmailToUser1730911713884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "temp_email" character varying(200)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "temp_email"
        `);
    }

}
