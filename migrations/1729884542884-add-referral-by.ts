import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReferralBy1729884542884 implements MigrationInterface {
    name = 'AddReferralBy1729884542884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP CONSTRAINT "FK_cae1425350da39cb85345115cbb"
        `);
        await queryRunner.query(`
            CREATE TABLE "user_referral" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "referred_by" bigint NOT NULL,
                "reward_amount" numeric NOT NULL DEFAULT '0',
                CONSTRAINT "UQ_c42dc27247a23f1a07645a1634e" UNIQUE ("user_id"),
                CONSTRAINT "PK_6ae3fd2cc21b481dabc7735016f" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "referred_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_referral"
            ADD CONSTRAINT "FK_872907853aa3b66088c707128f1" FOREIGN KEY ("referred_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_referral"
            ADD CONSTRAINT "FK_c42dc27247a23f1a07645a1634e" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_referral" DROP CONSTRAINT "FK_c42dc27247a23f1a07645a1634e"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_referral" DROP CONSTRAINT "FK_872907853aa3b66088c707128f1"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "referred_by" bigint
        `);
        await queryRunner.query(`
            DROP TABLE "user_referral"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD CONSTRAINT "FK_cae1425350da39cb85345115cbb" FOREIGN KEY ("referred_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
