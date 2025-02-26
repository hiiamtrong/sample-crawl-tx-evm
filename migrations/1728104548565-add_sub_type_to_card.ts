import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSubTypeToCard1728104548565 implements MigrationInterface {
    name = 'AddSubTypeToCard1728104548565';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cards"
            ADD "sub_type" character varying NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cards" DROP COLUMN "sub_type"
        `);
    }
}
