import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferralCode1729881978793 implements MigrationInterface {
    name = 'AddReferralCode1729881978793'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "referral_code" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "referral_code"
        `);
    }

}
