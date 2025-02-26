import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCardTable1729013372735 implements MigrationInterface {
    name = 'UpdateCardTable1729013372735'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cards" DROP COLUMN "earning_tokens"
        `);
        await queryRunner.query(`
            ALTER TABLE "cards"
            ADD "earning_token" integer NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "cards" DROP COLUMN "next_card_discount_percent"
        `);
        await queryRunner.query(`
            ALTER TABLE "cards"
            ADD "next_card_discount_percent" numeric NOT NULL DEFAULT '0'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cards" DROP COLUMN "next_card_discount_percent"
        `);
        await queryRunner.query(`
            ALTER TABLE "cards"
            ADD "next_card_discount_percent" jsonb NOT NULL DEFAULT '[]'
        `);
        await queryRunner.query(`
            ALTER TABLE "cards" DROP COLUMN "earning_token"
        `);
        await queryRunner.query(`
            ALTER TABLE "cards"
            ADD "earning_tokens" jsonb NOT NULL DEFAULT '[]'
        `);
    }

}
