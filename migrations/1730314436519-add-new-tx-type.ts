import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewTxType1730314436519 implements MigrationInterface {
    name = 'AddNewTxType1730314436519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."asset_transactions_type_enum"
            RENAME TO "asset_transactions_type_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."asset_transactions_type_enum" AS ENUM('deposit', 'withdraw', 'sweep', 'send_fee')
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "type" TYPE "public"."asset_transactions_type_enum" USING "type"::"text"::"public"."asset_transactions_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."asset_transactions_type_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."asset_transactions_type_enum_old" AS ENUM('deposit', 'withdraw', 'sweep')
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "type" TYPE "public"."asset_transactions_type_enum_old" USING "type"::"text"::"public"."asset_transactions_type_enum_old"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."asset_transactions_type_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."asset_transactions_type_enum_old"
            RENAME TO "asset_transactions_type_enum"
        `);
    }

}
