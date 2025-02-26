import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCard1727796540748 implements MigrationInterface {
    name = 'UpdateCard1727796540748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cards"
            ADD "name" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cards" DROP COLUMN "name"
        `);
    }

}
