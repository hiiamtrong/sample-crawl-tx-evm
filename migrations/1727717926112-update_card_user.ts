import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateCardUser1727717926112 implements MigrationInterface {
    name = 'UpdateCardUser1727717926112';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD CONSTRAINT "FK-cards-card_users" FOREIGN KEY ("card_id") REFERENCES "cards"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users"
            ADD CONSTRAINT "FK-users-card_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP CONSTRAINT "FK-users-card_users"
        `);
        await queryRunner.query(`
            ALTER TABLE "card_users" DROP CONSTRAINT "FK-cards-card_users"
        `);
    }
}
