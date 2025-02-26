import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFaq1729334608350 implements MigrationInterface {
    name = 'AddFaq1729334608350';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "faqs" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "question" text NOT NULL,
                "answer" text NOT NULL,
                CONSTRAINT "PK_2ddf4f2c910f8e8fa2663a67bf0" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TABLE "faqs"
        `);
    }
}
