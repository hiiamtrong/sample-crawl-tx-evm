import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCart1731731600835 implements MigrationInterface {
    name = 'AddCart1731731600835'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "carts" (
                "id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_b5f695a59f5ebb50af3c8160816" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "cart_items" (
                "id" bigint NOT NULL,
                "cart_id" bigint NOT NULL,
                "card_id" bigint NOT NULL,
                "amount" integer NOT NULL DEFAULT '1',
                CONSTRAINT "PK_6fccf5ec03c172d27a28a82928b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK-users-carts" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ADD CONSTRAINT "FK-carts-cart_items" FOREIGN KEY ("cart_id") REFERENCES "carts"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items"
            ADD CONSTRAINT "FK-cards-cart_items" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK-cards-cart_items"
        `);
        await queryRunner.query(`
            ALTER TABLE "cart_items" DROP CONSTRAINT "FK-carts-cart_items"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK-users-carts"
        `);
        await queryRunner.query(`
            DROP TABLE "cart_items"
        `);
        await queryRunner.query(`
            DROP TABLE "carts"
        `);
    }

}
