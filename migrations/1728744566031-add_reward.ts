import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReward1728744566031 implements MigrationInterface {
    name = 'AddReward1728744566031'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "rewards" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "amount" numeric(36, 8) NOT NULL DEFAULT '0',
                CONSTRAINT "PK_3d947441a48debeb9b7366f8b8c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD "reward_amount" numeric NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders"
            ADD "reward_amount" numeric NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE "rewards"
            ADD CONSTRAINT "FK_119e21376b9f407077a81c05be2" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "rewards" DROP CONSTRAINT "FK_119e21376b9f407077a81c05be2"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_orders" DROP COLUMN "reward_amount"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP COLUMN "reward_amount"
        `);
        await queryRunner.query(`
            DROP TABLE "rewards"
        `);
    }

}
