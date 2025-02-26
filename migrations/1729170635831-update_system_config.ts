import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateSystemConfig1729170635831 implements MigrationInterface {
    name = 'UpdateSystemConfig1729170635831'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP CONSTRAINT "UQ_5aff9a6d272a5cedf54d7aaf617"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "key"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."system_configs_key_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD "key" character varying NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD CONSTRAINT "UQ_5aff9a6d272a5cedf54d7aaf617" UNIQUE ("key")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP CONSTRAINT "UQ_5aff9a6d272a5cedf54d7aaf617"
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs" DROP COLUMN "key"
        `);
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
            ALTER TABLE "system_configs"
            ADD "key" "public"."system_configs_key_enum" NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "system_configs"
            ADD CONSTRAINT "UQ_5aff9a6d272a5cedf54d7aaf617" UNIQUE ("key")
        `);
    }

}
