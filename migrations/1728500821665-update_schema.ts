import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateSchema1728500821665 implements MigrationInterface {
    name = 'UpdateSchema1728500821665';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP CONSTRAINT "PK-transactions-asset_transactions"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP CONSTRAINT "REL_eb80afe9c26864ec7594a41ce7"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP COLUMN "transaction_id"
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD "transaction_id" bigint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD CONSTRAINT "REL_eb80afe9c26864ec7594a41ce7" UNIQUE ("transaction_id")
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD CONSTRAINT "PK-transactions-asset_transactions" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }
}
