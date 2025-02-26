import * as dotenv from 'dotenv';
import * as Joi from 'joi';
import { get, map } from 'lodash';
dotenv.config();

export interface EnvConfig {
  APP_ENV: string;
  APP_PORT: number;
  APP_HOST: string;
  FRONTEND_URL: string;
  ADMIN_URL: string;

  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASS: string;

  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASS?: string;
  REDIS_SSL?: boolean;

  JWT_ACCESS_TOKEN_EXP_IN_SEC: number;
  JWT_REFRESH_TOKEN_EXP_IN_SEC: number;
  JWT_PUBLIC_KEY_BASE64: string;
  JWT_PRIVATE_KEY_BASE64: string;

  DEFAULT_ADMIN_USER_PASSWORD: string;

  OTP_TTL_SEC: number;
  OTP_LENGTH: number;

  FIREBLOCKS_ENDPOINT: string;
  FIREBLOCKS_API_KEY: string;
  FIREBLOCKS_API_SECRET_PATH: string;
  FIREBLOCKS_PUBLIC_KEY_PATH: string;
  FIREBLOCKS_HOT_WALLET_ID: string;
  FIREBLOCKS_ENVIRONMENT: string;

  KAFKA_PROVIDER: string;
  KAFKA_CLIENT_ID: string;
  KAFKA_BROKERS: string;
  KAFKA_SSL: boolean;
  KAFKA_REGION: string;
  KAFKA_ACCESS_KEY_ID: string;
  KAFKA_SECRET_ACCESS_KEY: string;

  FIREBASE_SERVICE_ACCOUNT_PATH: string;

  CRYPTO_SECRET: string;
  CRYPTO_IV: string;

  MAIL_HOST: string;
  MAIL_PORT: number;
  MAIL_USER: string;
  MAIL_PASSWORD: string;
  MAIL_IGNORE_TLS: boolean;
  MAIL_REQUIRE_TLS: boolean;
  MAIL_SECURE: boolean;
  MAIL_DEFAULT_EMAIL: string;
  MAIL_DEFAULT_NAME: string;
  MAIL_CONCURRENCY: number;

  POLYGON_RPC_URL: string;
  POLYGON_WRITE_RPC_URL: string;
  POLYGON_DECIMALS: number;
  POLYGON_CHAIN_ID: string;
  POLYGON_USDT_START_BLOCK: number;
  POLYGON_USDT_ADDRESS: string;
  POLYGON_USDT_DECIMALS: number;
  POLYGON_USDT_INCREMENT_BLOCK: number;

  POLYGON_USDC_START_BLOCK: number;
  POLYGON_USDC_ADDRESS: string;
  POLYGON_USDC_DECIMALS: number;
  POLYGON_USDC_INCREMENT_BLOCK: number;

  POLYGON_ETH_START_BLOCK: number;
  POLYGON_ETH_ADDRESS: string;
  POLYGON_ETH_DECIMALS: number;
  POLYGON_ETH_INCREMENT_BLOCK: number;

  ETHEREUM_RPC_URL: string;
  ETHEREUM_WRITE_RPC_URL: string;
  ETHEREUM_CHAIN_ID: string;
  ETHEREUM_DECIMALS: number;

  ETHEREUM_USDT_START_BLOCK: number;
  ETHEREUM_USDT_ADDRESS: string;
  ETHEREUM_USDT_DECIMALS: number;
  ETHEREUM_USDT_INCREMENT_BLOCK: number;

  ETHEREUM_USDC_START_BLOCK: number;
  ETHEREUM_USDC_ADDRESS: string;
  ETHEREUM_USDC_DECIMALS: number;
  ETHEREUM_USDC_INCREMENT_BLOCK: number;

  ETHEREUM_ETH_START_BLOCK: number;
  ETHEREUM_ETH_ADDRESS: string;
  ETHEREUM_ETH_DECIMALS: number;
  ETHEREUM_ETH_INCREMENT_BLOCK: number;

  BSC_RPC_URL: string;
  BSC_WRITE_RPC_URL: string;
  BSC_CHAIN_ID: string;
  BSC_DECIMALS: number;

  BSC_USDT_START_BLOCK: number;
  BSC_USDT_ADDRESS: string;
  BSC_USDT_DECIMALS: number;
  BSC_USDT_INCREMENT_BLOCK: number;

  BSC_USDC_START_BLOCK: number;
  BSC_USDC_ADDRESS: string;
  BSC_USDC_DECIMALS: number;
  BSC_USDC_INCREMENT_BLOCK: number;

  BSC_ETH_START_BLOCK: number;
  BSC_ETH_ADDRESS: string;
  BSC_ETH_DECIMALS: number;
  BSC_ETH_INCREMENT_BLOCK: number;

  ADMIN_PRIVATE_KEY: string;

  GAS_LIMIT_NATIVE_TOKEN_TRANSFER: number;
  GAS_LIMIT_ERC20_TRANSFER: number;

  WEB3_MESSAGE: string;

  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ALARM_CHAT_ID: string;

  AWS_REGION: string;
}

export interface AppConfig {
  env: string;
  port: number;
  host: string;
  frontendUrl: string;
  adminUrl: string;
}

export interface DBConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  pass: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  pass?: string;
  url?: string;
}

export interface JWTConfig {
  accessTokenExpInSec: number;
  refreshTokenExpInSec: number;
  publicKey: string;
  privateKey: string;
}

export interface OTPConfig {
  length: number;
  ttl: number;
}

export interface FireblocksConfig {
  endpoint: string;
  apiKey: string;
  apiSecretPath: string;
  publicKeyPath: string;
  hotWalletId: string;
  environment: string;
}

export interface KafkaConfig {
  provider: string;
  clientId: string;
  brokers: string;
  ssl: boolean;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
}

export interface FirebaseConfig {
  serviceAccountPath: string;
}

export interface MailConfig {
  defaultEmail: string;
  defaultName: string;
  concurrency: number;
  smtp: {
    host: string;
    port: number;
    user: string;
    password: string;
    ignoreTLS: boolean;
    requireTLS: boolean;
    secure: boolean;
  };
  aws: {
    region: string;
  };
}

export interface BlockchainCrawlerConfig {
  rpcUrls: string[];
  writeRpcUrls: string[];
  decimals: number;
  chainId: string;

  usdtStartBlock: number;
  usdtAddress: string;
  usdtDecimals: number;
  usdtIncrementBlock: number;

  usdcStartBlock: number;
  usdcAddress: string;
  usdcDecimals: number;
  usdcIncrementBlock: number;

  ethStartBlock: number;
  ethAddress: string;
  ethDecimals: number;
  ethIncrementBlock: number;
}

export interface CryptoConfig {
  secret: string;
  iv: string;
}

export interface BlockchainAdminConfig {
  privateKey: string;
}

export interface TelegramConfig {
  botToken: string;
  alarmChatId: string;
}

export class AppConfigService {
  private readonly envConfig: EnvConfig;
  private readonly validationScheme = {
    APP_ENV: Joi.string()
      .valid('development', 'production', 'test')
      .default('development'),
    APP_PORT: Joi.number().required(),
    APP_HOST: Joi.string().default('localhost'),
    FRONTEND_URL: Joi.string().required(),
    ADMIN_URL: Joi.string().required(),

    DB_HOST: Joi.string().required(),
    DB_PORT: Joi.number().optional(),
    DB_NAME: Joi.string().required(),
    DB_USER: Joi.string().required(),
    DB_PASS: Joi.string().required(),

    REDIS_HOST: Joi.string().required(),
    REDIS_PORT: Joi.number().required(),
    REDIS_PASS: Joi.string().optional(),
    REDIS_SSL: Joi.boolean().optional(),

    JWT_PUBLIC_KEY_BASE64: Joi.string().required(),
    JWT_PRIVATE_KEY_BASE64: Joi.string().required(),
    JWT_ACCESS_TOKEN_EXP_IN_SEC: Joi.number().required(),
    JWT_REFRESH_TOKEN_EXP_IN_SEC: Joi.number().required(),
    DEFAULT_ADMIN_USER_PASSWORD: Joi.string().required(),

    OTP_LENGTH: Joi.number().required(),
    OTP_TTL_SEC: Joi.number().required(),

    KAFKA_PROVIDER: Joi.string().required(),
    KAFKA_CLIENT_ID: Joi.string().required(),
    KAFKA_BROKERS: Joi.string().required(),
    KAFKA_SSL: Joi.boolean().optional(),
    KAFKA_REGION: Joi.string().optional(),
    KAFKA_ACCESS_KEY_ID: Joi.string().optional().allow(null, ''),
    KAFKA_SECRET_ACCESS_KEY: Joi.string().optional().allow(null, ''),

    FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().required(),

    MAIL_HOST: Joi.string().required(),
    MAIL_PORT: Joi.number().required(),
    MAIL_USER: Joi.string().optional().allow(null, ''),
    MAIL_PASSWORD: Joi.string().optional().allow(null, ''),
    MAIL_IGNORE_TLS: Joi.boolean().required(),
    MAIL_REQUIRE_TLS: Joi.boolean().required(),
    MAIL_SECURE: Joi.boolean().required(),
    MAIL_DEFAULT_EMAIL: Joi.string().required(),
    MAIL_DEFAULT_NAME: Joi.string().required(),

    CRYPTO_SECRET: Joi.string().required(),
    CRYPTO_IV: Joi.string().required(),

    POLYGON_RPC_URL: Joi.string().required(),
    POLYGON_WRITE_RPC_URL: Joi.string().required(),
    POLYGON_DECIMALS: Joi.number().required(),
    POLYGON_CHAIN_ID: Joi.string().required(),

    POLYGON_USDT_START_BLOCK: Joi.number().required(),
    POLYGON_USDT_ADDRESS: Joi.string().required(),
    POLYGON_USDT_DECIMALS: Joi.number().required(),
    POLYGON_USDT_INCREMENT_BLOCK: Joi.number().required(),

    POLYGON_USDC_START_BLOCK: Joi.number().required(),
    POLYGON_USDC_ADDRESS: Joi.string().required(),
    POLYGON_USDC_DECIMALS: Joi.number().required(),
    POLYGON_USDC_INCREMENT_BLOCK: Joi.number().required(),

    POLYGON_ETH_START_BLOCK: Joi.number().required(),
    POLYGON_ETH_ADDRESS: Joi.string().required(),
    POLYGON_ETH_DECIMALS: Joi.number().required(),
    POLYGON_ETH_INCREMENT_BLOCK: Joi.number().required(),

    ETHEREUM_RPC_URL: Joi.string().required(),
    ETHEREUM_WRITE_RPC_URL: Joi.string().required(),
    ETHEREUM_CHAIN_ID: Joi.string().required(),
    ETHEREUM_DECIMALS: Joi.number().required(),

    ETHEREUM_USDT_START_BLOCK: Joi.number().required(),
    ETHEREUM_USDT_ADDRESS: Joi.string().required(),
    ETHEREUM_USDT_DECIMALS: Joi.number().required(),
    ETHEREUM_USDT_INCREMENT_BLOCK: Joi.number().required(),

    ETHEREUM_USDC_START_BLOCK: Joi.number().required(),
    ETHEREUM_USDC_ADDRESS: Joi.string().required(),
    ETHEREUM_USDC_DECIMALS: Joi.number().required(),
    ETHEREUM_USDC_INCREMENT_BLOCK: Joi.number().required(),

    ETHEREUM_ETH_START_BLOCK: Joi.number().required(),
    ETHEREUM_ETH_ADDRESS: Joi.string().required(),
    ETHEREUM_ETH_DECIMALS: Joi.number().required(),
    ETHEREUM_ETH_INCREMENT_BLOCK: Joi.number().required(),

    BSC_RPC_URL: Joi.string().required(),
    BSC_WRITE_RPC_URL: Joi.string().required(),
    BSC_CHAIN_ID: Joi.string().required(),
    BSC_DECIMALS: Joi.number().required(),

    BSC_USDT_START_BLOCK: Joi.number().required(),
    BSC_USDT_ADDRESS: Joi.string().required(),
    BSC_USDT_DECIMALS: Joi.number().required(),
    BSC_USDT_INCREMENT_BLOCK: Joi.number().required(),

    BSC_USDC_START_BLOCK: Joi.number().required(),
    BSC_USDC_ADDRESS: Joi.string().required(),
    BSC_USDC_DECIMALS: Joi.number().required(),
    BSC_USDC_INCREMENT_BLOCK: Joi.number().required(),

    BSC_ETH_START_BLOCK: Joi.number().required(),
    BSC_ETH_ADDRESS: Joi.string().required(),
    BSC_ETH_DECIMALS: Joi.number().required(),
    BSC_ETH_INCREMENT_BLOCK: Joi.number().required(),

    ADMIN_PRIVATE_KEY: Joi.string().required(),

    GAS_LIMIT_NATIVE_TOKEN_TRANSFER: Joi.number().required(),
    GAS_LIMIT_ERC20_TRANSFER: Joi.number().required(),

    WEB3_MESSAGE: Joi.string().required(),

    TELEGRAM_BOT_TOKEN: Joi.string().required(),
    TELEGRAM_ALARM_CHAT_ID: Joi.string().required(),

    AWS_REGION: Joi.string().required(),

  };

  constructor() {
    this.envConfig = this.validateInput(process.env);
    console.log(
      'AppConfigService -> constructor -> this.envConfig',
      this.envConfig,
    );
  }

  private validateInput(envConfig: dotenv.DotenvParseOutput): EnvConfig {
    const envVarsSchema: Joi.ObjectSchema = Joi.object(this.validationScheme);
    const validation = envVarsSchema.validate(envConfig, {
      abortEarly: false,
      allowUnknown: true,
    });
    if (validation.error) {
      throw new Error(
        `Config validation error:\n${map(
          get(validation, 'error.details'),
          (x) => x.message,
        ).join('\n')}`,
      );
    }

    // ignore unknown keys
    const validatedEnvConfig = validation.value as EnvConfig;
    return validatedEnvConfig;
  }

  get app(): AppConfig {
    return {
      env: String(this.envConfig.APP_ENV),
      port: this.envConfig.APP_PORT,
      host: String(this.envConfig.APP_HOST),
      frontendUrl: String(this.envConfig.FRONTEND_URL),
      adminUrl: String(this.envConfig.ADMIN_URL),
    };
  }

  get db(): DBConfig {
    return {
      host: String(this.envConfig.DB_HOST),
      port: this.envConfig.DB_PORT,
      name: String(this.envConfig.DB_NAME),
      user: String(this.envConfig.DB_USER),
      pass: String(this.envConfig.DB_PASS),
    };
  }

  get jwt(): JWTConfig {
    return {
      accessTokenExpInSec: this.envConfig.JWT_ACCESS_TOKEN_EXP_IN_SEC,
      refreshTokenExpInSec: this.envConfig.JWT_REFRESH_TOKEN_EXP_IN_SEC,
      publicKey: Buffer.from(
        this.envConfig.JWT_PUBLIC_KEY_BASE64,
        'base64',
      ).toString('utf-8'),
      privateKey: Buffer.from(
        this.envConfig.JWT_PRIVATE_KEY_BASE64,
        'base64',
      ).toString('utf-8'),
    };
  }

  get otp(): OTPConfig {
    return {
      length: this.envConfig.OTP_LENGTH,
      ttl: this.envConfig.OTP_TTL_SEC * 1000,
    };
  }

  get redis(): RedisConfig {
    const protocol = this.envConfig.REDIS_SSL ? 'rediss' : 'redis';
    return {
      host: String(this.envConfig.REDIS_HOST),
      port: this.envConfig.REDIS_PORT,
      pass: String(this.envConfig.REDIS_PASS),
      url: `${protocol}://${this.envConfig.REDIS_HOST}:${this.envConfig.REDIS_PORT}`,
    };
  }

  get defaultAdminUserPassword(): string {
    return String(this.envConfig.DEFAULT_ADMIN_USER_PASSWORD);
  }

  get fireblocks(): FireblocksConfig {
    return {
      endpoint: String(this.envConfig.FIREBLOCKS_ENDPOINT),
      apiKey: String(this.envConfig.FIREBLOCKS_API_KEY),
      apiSecretPath: String(this.envConfig.FIREBLOCKS_API_SECRET_PATH),
      publicKeyPath: String(this.envConfig.FIREBLOCKS_PUBLIC_KEY_PATH),
      hotWalletId: String(this.envConfig.FIREBLOCKS_HOT_WALLET_ID),
      environment: String(this.envConfig.FIREBLOCKS_ENVIRONMENT),
    };
  }

  get kafka(): KafkaConfig {
    return {
      provider: String(this.envConfig.KAFKA_PROVIDER),
      clientId: String(this.envConfig.KAFKA_CLIENT_ID),
      brokers: String(this.envConfig.KAFKA_BROKERS),
      ssl: Boolean(this.envConfig.KAFKA_SSL),
      region: String(this.envConfig.KAFKA_REGION),
      accessKeyId: String(this.envConfig.KAFKA_ACCESS_KEY_ID),
      secretAccessKey: String(this.envConfig.KAFKA_SECRET_ACCESS_KEY),
    };
  }

  get firebase(): FirebaseConfig {
    return {
      serviceAccountPath: String(this.envConfig.FIREBASE_SERVICE_ACCOUNT_PATH),
    };
  }

  get mail(): MailConfig {
    return {
      defaultEmail: String(this.envConfig.MAIL_DEFAULT_EMAIL),
      defaultName: String(this.envConfig.MAIL_DEFAULT_NAME),
      concurrency: this.envConfig.MAIL_CONCURRENCY,
      smtp: {
        host: String(this.envConfig.MAIL_HOST),
        port: this.envConfig.MAIL_PORT,
        user: String(this.envConfig.MAIL_USER),
        password: String(this.envConfig.MAIL_PASSWORD),
        ignoreTLS: Boolean(this.envConfig.MAIL_IGNORE_TLS),
        requireTLS: Boolean(this.envConfig.MAIL_REQUIRE_TLS),
        secure: Boolean(this.envConfig.MAIL_SECURE),
      },
      aws: {
        region: String(this.envConfig.AWS_REGION),
      },
    };
  }

  get polygon(): BlockchainCrawlerConfig {
    return {
      rpcUrls: this.envConfig.POLYGON_RPC_URL.split(','),
      writeRpcUrls: this.envConfig.POLYGON_WRITE_RPC_URL.split(','),
      chainId: this.envConfig.POLYGON_CHAIN_ID,
      decimals: this.envConfig.POLYGON_DECIMALS,

      usdtStartBlock: this.envConfig.POLYGON_USDT_START_BLOCK,
      usdtAddress: this.envConfig.POLYGON_USDT_ADDRESS,
      usdtDecimals: this.envConfig.POLYGON_USDT_DECIMALS,
      usdtIncrementBlock: this.envConfig.POLYGON_USDT_INCREMENT_BLOCK,

      usdcStartBlock: this.envConfig.POLYGON_USDC_START_BLOCK,
      usdcAddress: this.envConfig.POLYGON_USDC_ADDRESS,
      usdcDecimals: this.envConfig.POLYGON_USDC_DECIMALS,
      usdcIncrementBlock: this.envConfig.POLYGON_USDC_INCREMENT_BLOCK,

      ethStartBlock: this.envConfig.POLYGON_ETH_START_BLOCK,
      ethAddress: this.envConfig.POLYGON_ETH_ADDRESS,
      ethDecimals: this.envConfig.POLYGON_ETH_DECIMALS,
      ethIncrementBlock: this.envConfig.POLYGON_ETH_INCREMENT_BLOCK,
    };
  }

  get ethereum(): BlockchainCrawlerConfig {
    return {
      rpcUrls: this.envConfig.ETHEREUM_RPC_URL.split(','),
      writeRpcUrls: this.envConfig.ETHEREUM_WRITE_RPC_URL.split(','),
      chainId: this.envConfig.ETHEREUM_CHAIN_ID,
      decimals: this.envConfig.ETHEREUM_DECIMALS,

      usdtStartBlock: this.envConfig.ETHEREUM_USDT_START_BLOCK,
      usdtAddress: this.envConfig.ETHEREUM_USDT_ADDRESS,
      usdtDecimals: this.envConfig.ETHEREUM_USDT_DECIMALS,
      usdtIncrementBlock: this.envConfig.ETHEREUM_USDT_INCREMENT_BLOCK,

      usdcStartBlock: this.envConfig.ETHEREUM_USDC_START_BLOCK,
      usdcAddress: this.envConfig.ETHEREUM_USDC_ADDRESS,
      usdcDecimals: this.envConfig.ETHEREUM_USDC_DECIMALS,
      usdcIncrementBlock: this.envConfig.ETHEREUM_USDC_INCREMENT_BLOCK,

      ethStartBlock: this.envConfig.ETHEREUM_ETH_START_BLOCK,
      ethAddress: this.envConfig.ETHEREUM_ETH_ADDRESS,
      ethDecimals: this.envConfig.ETHEREUM_ETH_DECIMALS,
      ethIncrementBlock: this.envConfig.ETHEREUM_ETH_INCREMENT_BLOCK,
    };
  }

  get bsc(): BlockchainCrawlerConfig {
    return {
      rpcUrls: this.envConfig.BSC_RPC_URL.split(','),
      writeRpcUrls: this.envConfig.BSC_WRITE_RPC_URL.split(','),
      chainId: this.envConfig.BSC_CHAIN_ID,
      decimals: this.envConfig.BSC_DECIMALS,

      usdtStartBlock: this.envConfig.BSC_USDT_START_BLOCK,
      usdtAddress: this.envConfig.BSC_USDT_ADDRESS,
      usdtDecimals: this.envConfig.BSC_USDT_DECIMALS,
      usdtIncrementBlock: this.envConfig.BSC_USDT_INCREMENT_BLOCK,

      usdcStartBlock: this.envConfig.BSC_USDC_START_BLOCK,
      usdcAddress: this.envConfig.BSC_USDC_ADDRESS,
      usdcDecimals: this.envConfig.BSC_USDC_DECIMALS,
      usdcIncrementBlock: this.envConfig.BSC_USDC_INCREMENT_BLOCK,

      ethStartBlock: this.envConfig.BSC_ETH_START_BLOCK,
      ethAddress: this.envConfig.BSC_ETH_ADDRESS,
      ethDecimals: this.envConfig.BSC_ETH_DECIMALS,
      ethIncrementBlock: this.envConfig.BSC_ETH_INCREMENT_BLOCK,
    };
  }

  get crypto(): CryptoConfig {
    return {
      secret: this.envConfig.CRYPTO_SECRET,
      iv: this.envConfig.CRYPTO_IV,
    };
  }

  get blockchainAdmin(): BlockchainAdminConfig {
    return {
      privateKey: String(this.envConfig.ADMIN_PRIVATE_KEY),
    };
  }

  get gasLimitNativeTokenTransfer(): number {
    return this.envConfig.GAS_LIMIT_NATIVE_TOKEN_TRANSFER;
  }

  get gasLimitErc20Transfer(): number {
    return this.envConfig.GAS_LIMIT_ERC20_TRANSFER;
  }

  get web3Message(): string {
    return this.envConfig.WEB3_MESSAGE;
  }

  get telegram(): TelegramConfig {
    return {
      botToken: this.envConfig.TELEGRAM_BOT_TOKEN,
      alarmChatId: this.envConfig.TELEGRAM_ALARM_CHAT_ID,
    };
  }
}
