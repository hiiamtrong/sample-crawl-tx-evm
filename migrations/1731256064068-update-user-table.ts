import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserTable1731256064068 implements MigrationInterface {
    name = 'UpdateUserTable1731256064068'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "first_login" boolean NOT NULL DEFAULT true
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."users_auth_provider_enum" AS ENUM('basic', 'google', 'web3')
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "auth_provider" "public"."users_auth_provider_enum" NOT NULL DEFAULT 'basic'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "auth_provider"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."users_auth_provider_enum"
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "first_login"
        `);
    }

}
