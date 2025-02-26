import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCountry1728099813946 implements MigrationInterface {
    name = 'AddCountry1728099813946';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "country_currencies" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" SERIAL NOT NULL,
                "currency" character varying NOT NULL,
                "country_id" integer,
                CONSTRAINT "REL_c92874cdba97f440342b5d593e" UNIQUE ("country_id"),
                CONSTRAINT "PK_29f75908ed8f1ea61d92549d014" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "countries" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" integer NOT NULL,
                "name" character varying(100) NOT NULL,
                "iso2" character varying(2) NOT NULL,
                "iso3" character varying(3) NOT NULL,
                "numeric_code" integer NOT NULL,
                CONSTRAINT "PK_b2d7006793e8697ab3ae2deff18" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "country_currencies"
            ADD CONSTRAINT "FK-countries-countries_currencies" FOREIGN KEY ("country_id") REFERENCES "countries"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "country_currencies" DROP CONSTRAINT "FK-countries-countries_currencies"
        `);
        await queryRunner.query(`
            DROP TABLE "countries"
        `);
        await queryRunner.query(`
            DROP TABLE "country_currencies"
        `);
    }
}
