import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCardUser1727716347510 implements MigrationInterface {
    name = 'AddCardUser1727716347510'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "user_wallets" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "fireblocks_wallet_id" character varying(255) NOT NULL,
                "asset_token_id" bigint NOT NULL,
                "address" character varying(255) NOT NULL,
                CONSTRAINT "PK_f98089275dcfc65d59b1d347167" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX "user_fireblocks_asset_idx" ON "user_wallets" ("user_id", "fireblocks_wallet_id")
        `);
        await queryRunner.query(`
            CREATE TABLE "asset_tokens" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "symbol" character varying(50) NOT NULL,
                "name" character varying(50) NOT NULL,
                "network" character varying(50) NOT NULL,
                "currency" character varying(50) NOT NULL,
                "coingeckoId" character varying(50) NOT NULL,
                "fireblocksId" character varying(50) NOT NULL,
                CONSTRAINT "PK_31acb024d4df9f4bf15665d5b06" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."transactions_kind_enum" AS ENUM('ASSET')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."transactions_type_enum" AS ENUM('DEPOSIT', 'WITHDRAWAL', 'SWEEP')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."transactions_status_enum" AS ENUM('PENDING', 'COMPLETED', 'FAILED')
        `);
        await queryRunner.query(`
            CREATE TABLE "transactions" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "kind" "public"."transactions_kind_enum" NOT NULL,
                "type" "public"."transactions_type_enum" NOT NULL,
                "user_id" bigint NOT NULL,
                "status" "public"."transactions_status_enum" NOT NULL DEFAULT 'PENDING',
                "date" TIMESTAMP NOT NULL,
                "last_updated_at" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_a219afd8dd77ed80f5a862f1db9" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."asset_transactions_type_enum" AS ENUM('deposit', 'withdraw', 'sweep')
        `);
        await queryRunner.query(`
            CREATE TYPE "public"."asset_transactions_status_enum" AS ENUM('Pending', 'Completed', 'Failed')
        `);
        await queryRunner.query(`
            CREATE TABLE "asset_transactions" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" bigint NOT NULL,
                "transaction_id" bigint NOT NULL,
                "fireblocks_tx_id" character varying(100) NOT NULL,
                "type" "public"."asset_transactions_type_enum" NOT NULL,
                "user_id" bigint NOT NULL,
                "status" "public"."asset_transactions_status_enum" NOT NULL DEFAULT 'Pending',
                "asset_token_id" bigint NOT NULL,
                "tx" character varying(100),
                "amount" character varying(100) NOT NULL,
                "final_amount" character varying(100),
                "network_fee_amount" character varying NOT NULL DEFAULT '0',
                "usd_amount" character varying(100),
                "from" character varying(100),
                "to" character varying(100),
                "params" json,
                "fail_reason" character varying,
                CONSTRAINT "REL_eb80afe9c26864ec7594a41ce7" UNIQUE ("transaction_id"),
                CONSTRAINT "PK_b8fb08669f6493872b120ded3a7" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "card_users" (
                "id" bigint NOT NULL,
                "card_id" bigint NOT NULL,
                "user_id" bigint NOT NULL,
                "card_order" integer NOT NULL,
                "purchase_price" numeric NOT NULL,
                "purchase_date" TIMESTAMP NOT NULL,
                CONSTRAINT "PK_d85613b9bf9a624eb45a2b3759c" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "fireblocks_webhook_transactions" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" character varying NOT NULL,
                "type" character varying NOT NULL,
                "timestamp" bigint NOT NULL,
                "tenant_id" character varying NOT NULL,
                "data" json NOT NULL,
                CONSTRAINT "PK_183986e6740775b79be4c253dac" PRIMARY KEY ("id", "type")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "fireblocks_internal_assets" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "fireblocks_internal_wallet_id" character varying(100) NOT NULL,
                "fireblocks_asset_id" character varying(100) NOT NULL,
                "user_id" bigint NOT NULL,
                "address" character varying(100) NOT NULL,
                CONSTRAINT "PK_3c977b6bb0e90d90fc7eb0dbdb1" PRIMARY KEY (
                    "fireblocks_internal_wallet_id",
                    "fireblocks_asset_id"
                )
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "fireblocks_internal_wallets" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" character varying NOT NULL,
                "user_id" bigint NOT NULL,
                CONSTRAINT "PK_4e244fdc9b4398e39fa9dcd1ac6" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            CREATE TABLE "fireblocks_vaults" (
                "created_by" character varying,
                "updated_by" character varying,
                "is_deleted" boolean NOT NULL DEFAULT false,
                "deleted_by" character varying,
                "created_at" TIMESTAMP DEFAULT now(),
                "updated_at" TIMESTAMP DEFAULT now(),
                "deleted_at" TIMESTAMP,
                "id" character varying NOT NULL,
                "user_id" bigint NOT NULL,
                CONSTRAINT "PK_4aeca62c29b4e43c0f0d91c358b" PRIMARY KEY ("id")
            )
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
            ADD CONSTRAINT "FK-users-user_wallets" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets"
            ADD CONSTRAINT "FK-asset_tokens-user_wallets" FOREIGN KEY ("asset_token_id") REFERENCES "asset_tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "transactions"
            ADD CONSTRAINT "PK-users-transactions" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD CONSTRAINT "PK-users-asset_transactions" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD CONSTRAINT "PK-transactions-asset_transactions" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions"
            ADD CONSTRAINT "PK-asset_tokens-asset_transactions" FOREIGN KEY ("asset_token_id") REFERENCES "asset_tokens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP CONSTRAINT "PK-asset_tokens-asset_transactions"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP CONSTRAINT "PK-transactions-asset_transactions"
        `);
        await queryRunner.query(`
            ALTER TABLE "asset_transactions" DROP CONSTRAINT "PK-users-asset_transactions"
        `);
        await queryRunner.query(`
            ALTER TABLE "transactions" DROP CONSTRAINT "PK-users-transactions"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets" DROP CONSTRAINT "FK-asset_tokens-user_wallets"
        `);
        await queryRunner.query(`
            ALTER TABLE "user_wallets" DROP CONSTRAINT "FK-users-user_wallets"
        `);
        await queryRunner.query(`
            DROP TABLE "fireblocks_vaults"
        `);
        await queryRunner.query(`
            DROP TABLE "fireblocks_internal_wallets"
        `);
        await queryRunner.query(`
            DROP TABLE "fireblocks_internal_assets"
        `);
        await queryRunner.query(`
            DROP TABLE "fireblocks_webhook_transactions"
        `);
        await queryRunner.query(`
            DROP TABLE "card_users"
        `);
        await queryRunner.query(`
            DROP TABLE "asset_transactions"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."asset_transactions_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."asset_transactions_type_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "transactions"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."transactions_status_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."transactions_type_enum"
        `);
        await queryRunner.query(`
            DROP TYPE "public"."transactions_kind_enum"
        `);
        await queryRunner.query(`
            DROP TABLE "asset_tokens"
        `);
        await queryRunner.query(`
            DROP INDEX "public"."user_fireblocks_asset_idx"
        `);
        await queryRunner.query(`
            DROP TABLE "user_wallets"
        `);
    }

}
