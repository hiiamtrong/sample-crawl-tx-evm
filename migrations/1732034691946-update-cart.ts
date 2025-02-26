import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCart1732034691946 implements MigrationInterface {
    name = 'UpdateCart1732034691946'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK-users-carts"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "UQ_2ec1c94a977b940d85a4f498aea" UNIQUE ("user_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK-users-carts" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "FK-users-carts"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts" DROP CONSTRAINT "UQ_2ec1c94a977b940d85a4f498aea"
        `);
        await queryRunner.query(`
            ALTER TABLE "carts"
            ADD CONSTRAINT "FK-users-carts" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
