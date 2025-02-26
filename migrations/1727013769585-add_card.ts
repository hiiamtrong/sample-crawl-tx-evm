import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCard1727013769585 implements MigrationInterface {
    name = 'AddCard1727013769585';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."cards_type_enum" AS ENUM('PLASTIC', 'METAL')
        `);
        await queryRunner.query(`
            CREATE TABLE "cards" (
                "id" bigint NOT NULL,
                "type" "public"."cards_type_enum" NOT NULL,
                "metadata" jsonb NOT NULL DEFAULT '{}',
                "price" jsonb NOT NULL DEFAULT '[]',
                "max_owned" integer NOT NULL DEFAULT '5',
                "earning_tokens" jsonb NOT NULL DEFAULT '[]',
                "next_card_discount_percent" jsonb NOT NULL DEFAULT '[]',
                CONSTRAINT "PK_5f3269634705fdff4a9935860fc" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "cards"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."cards_type_enum"
        `);
    }
}
