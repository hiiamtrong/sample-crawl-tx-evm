import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAliasToUser1731728232684 implements MigrationInterface {
    name = 'AddAliasToUser1731728232684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "alias" character varying(200)
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "UQ_f002c336d3299ee4eba00196902" UNIQUE ("alias")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "UQ_f002c336d3299ee4eba00196902"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "alias"
        `);
    }

}
