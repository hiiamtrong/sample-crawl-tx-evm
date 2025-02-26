import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewAssetStatus1732620433529 implements MigrationInterface {
    name = 'AddNewAssetStatus1732620433529'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TYPE "public"."asset_transactions_status_enum"
            RENAME TO "asset_transactions_status_enum_old"
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."asset_transactions_status_enum" AS ENUM(
                'Pending',
                'Completed',
                'Failed',
                'Not_Qualified'
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "status" TYPE "public"."asset_transactions_status_enum" USING "status"::"text"::"public"."asset_transactions_status_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "status"
            SET DEFAULT 'Pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."asset_transactions_status_enum_old"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."asset_transactions_status_enum_old" AS ENUM('Pending', 'Completed', 'Failed')
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "status" DROP DEFAULT
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "status" TYPE "public"."asset_transactions_status_enum_old" USING "status"::"text"::"public"."asset_transactions_status_enum_old"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ALTER COLUMN "status"
            SET DEFAULT 'Pending'
        `);
        await queryRunner.query(`
            DROP TYPE "public"."asset_transactions_status_enum"
        `);
        await queryRunner.query(`
            ALTER TYPE "public"."asset_transactions_status_enum_old"
            RENAME TO "asset_transactions_status_enum"
        `);
    }

}
