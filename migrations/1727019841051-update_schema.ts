import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchema1727019841051 implements MigrationInterface {
    name = 'UpdateSchema1727019841051';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "operators" DROP CONSTRAINT "PK_3d02b3692836893720335a79d1b"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "id" bigint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD CONSTRAINT "PK_3d02b3692836893720335a79d1b" PRIMARY KEY ("id")
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "created_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "created_by" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "updated_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "updated_by" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "deleted_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "deleted_by" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "updated_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "updated_by" character varying
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "deleted_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "deleted_by" character varying
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "deleted_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "deleted_by" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN "updated_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD "updated_by" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "deleted_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "deleted_by" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "updated_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "updated_by" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "created_by"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "created_by" integer
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP CONSTRAINT "PK_3d02b3692836893720335a79d1b"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators" DROP COLUMN "id"
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD "id" SERIAL NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "operators"
            ADD CONSTRAINT "PK_3d02b3692836893720335a79d1b" PRIMARY KEY ("id")
        `);
    }
}
