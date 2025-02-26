import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserBalance1727018859945 implements MigrationInterface {
    name = 'AddUserBalance1727018859945';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_balances" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "amount" numeric(18, 8) NOT NULL DEFAULT '0',
                "locked_amount" numeric(18, 8) NOT NULL DEFAULT '0',
                CONSTRAINT "REL_20b0310de6568079cd087842fb" UNIQUE ("user_id"),
                CONSTRAINT "PK_bf6c91bf949d39175f095c6c3d4" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user_balances"
            ADD CONSTRAINT "FK_20b0310de6568079cd087842fbc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "user_balances" DROP CONSTRAINT "FK_20b0310de6568079cd087842fbc"
        `);
        await queryRunner.query(`
            DROP TABLE "user_balances"
        `);
    }
}
