import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSystemConfig1726976513478 implements MigrationInterface {
    name = 'AddSystemConfig1726976513478';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."system_configs_key_enum" AS ENUM(
                'CARD_PRICE',
                'DISCOUNT_PERCENTAGE_NEXT_CARD',
                'CARD_PRICE_PERCENTAGE_INCREASE_PER_PERIOD',
                'INCREASE_PERIOD_IN_DAYS',
                'MAX_NUMBER_OF_CARDS_PER_CARD_TYPE',
                'TOKEN_RECEIVE_EACH_NEW_CARD'
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "system_configs" (
                "created_by" integer NOT NULL,
                "updated_by" integer,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" integer,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "key" "public"."system_configs_key_enum" NOT NULL,
                "value" jsonb NOT NULL,
                "description" character varying,
                CONSTRAINT "UQ_5aff9a6d272a5cedf54d7aaf617" UNIQUE ("key"),
                CONSTRAINT "PK_29ac548e654c799fd885e1b9b71" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "system_configs"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."system_configs_key_enum"
        `);
    }
}
