import { HttpException, HttpStatus } from '@nestjs/common';

export class AppException extends HttpException {
  public localizedMessage: Record<string, string>;
  public details: string | Record<string, any>;
  public code: AppExceptionCode;

  constructor(
    code: AppExceptionCode,
    message: string,
    status: number,
    details?: string | Record<string, any>,
    localizedMessage?: Record<string, string>,
  ) {
    // Calling parent constructor of base Exception class.
    super(message, status);

    this.name = AppException.name;
    this.localizedMessage = localizedMessage;
    this.details = details;
    this.code = code;
  }

  wrapError(error: string | Record<string, any>): AppException {
    let details = this.details || {};
    if (typeof details === 'string') {
      details = {
        message: details,
      };
    }
    return new AppException(this.code, this.message, this.getStatus(), {
      wrappedError: error,
      details,
    });
  }
}

export enum AppExceptionCode {
  BAD_REQUEST = '0400',
  INTERNAL_SERVER_ERROR = '0500',
  CONCURRENT_OPERATION = '0409',
  INVALID_PARAMS = '0422',

  USER_EMAIL_ALREADY_EXISTS = '1000',
  USER_NOT_FOUND = '1001',
  USER_PASSWORD_INCORRECT = '1002',
  USER_NOT_ACTIVE = '1003',
  USER_NOT_VERIFIED = '1004',
  USER_OTP_INCORRECT = '1005',
  USER_OTP_EXPIRED = '1006',
  USER_OTP_SENT_TO_EMAIL = '1007',
  USER_ALREADY_ACTIVE = '1008',
  USER_EMAIL_NOT_VERIFIED = '1009',
  USER_IS_INACTIVE = '1010',
  USER_COUNTRY_ALREADY_EXISTS = '1011',
  USER_REFERRAL_CODE_NOT_FOUND = '1012',
  USER_WALLET_NOT_FOUND = '1013',
  USER_SIGNATURE_INVALID = '1014',
  USER_REFERRAL_NOT_FOUND = '1015',
  USER_ADDRESS_ALREADY_EXISTS = '1016',
  USER_DISABLED_PURCHASE = '1017',
  USER_DISABLED_REDEEM = '1018',
  USER_EMAIL_NOT_MATCH = '1019',
  USER_ALREADY_REFERRED = '1020',
  USER_NOT_FIRST_LOGIN = '1021',
  CANNOT_REFER_SELF = '1022',
  USER_ALIAS_ALREADY_EXISTS = '1023',
  USER_ALIAS_NOT_SET = '1024',
  AUTH_INVALID_CREDENTIALS = '1025',

  OPERATOR_NOT_ACTIVE = '2000',
  OPERATOR_NOT_FOUND = '2001',
  OPERATOR_ALREADY_ACTIVE = '2002',
  OPERATOR_OTP_INCORRECT = '2003',
  OPERATOR_PASSWORD_INCORRECT = '2004',
  OPERATOR_NOT_AUTHORIZED = '2005',

  // Add new card-related exception codes
  CARD_NOT_FOUND = '3000',
  CARD_CREATION_FAILED = '3001',
  CARD_UPDATE_FAILED = '3002',
  CARD_DELETION_FAILED = '3003',
  CARD_DISCOUNT_NOT_FOUND = '3004',
  CARD_PRICE_NOT_SUPPORTED = '3005',
  CARD_MAX_OWNED = '3006',
  CARD_ALREADY_REDEEMED = '3007',
  CARD_ORDER_NOT_COMPLETED = '3008',
  CARD_ORDER_NOT_FOUND = '3009',
  CARD_IDS_PROVIDED_IS_INVALID = '3010',

  INSUFFICIENT_BALANCE = '4000',

  FIREBLOCKS_CREATE_VAULT_FAILED = '5000',
  FIREBLOCKS_CREATE_ASSET_FAILED = '5001',
  FIREBLOCKS_CREATE_INTERNAL_WALLET_FAILED = '5002',
  FIREBLOCKS_UPDATE_INTERNAL_WALLET_FAILED = '5003',
  FIREBLOCKS_DELETE_INTERNAL_WALLET_FAILED = '5004',
  FIREBLOCKS_CREATE_EXTERNAL_WALLET_FAILED = '5005',
  FIREBLOCKS_VAULT_NOT_FOUND = '5006',
  FIREBLOCKS_INTERNAL_WALLET_NOT_FOUND = '5007',
  FIREBLOCKS_EXTERNAL_WALLET_NOT_FOUND = '5008',
  FIREBLOCKS_CREATE_TRANSACTION_FAILED = '5009',
  FIREBLOCKS_ESTIMATE_NETWORK_FEE_FAILED = '5010',
  FIREBLOCKS_GET_GAS_STATION_FAILED = '5011',
  FIREBLOCKS_GET_PAGED_VAULT_ACCOUNTS_FAILED = '5012',
  FIREBLOCKS_GET_ASSET_FAILED = '5013',
  FIREBLOCKS_GET_ASSET_ADDRESSES_FAILED = '5014',

  ASSET_TOKEN_NOT_FOUND = '6000',

  COUNTRY_NOT_FOUND = '7000',
  COUNTRY_BLACKLISTED = '7001',
  INSUFFICIENT_REWARD = '8000',

  NETWORK_NOT_FOUND = '9000',
  NETWORK_NOT_SUPPORTED = '9001',

  SYSTEM_CONFIG_NOT_FOUND = '10000',

  WITHDRAW_TRANSACTION_FAILED = '11000',

  CART_NOT_FOUND = '12000',
  CART_ITEM_NOT_FOUND = '12001',

}

export const AppExceptions: Record<AppExceptionCode, AppException> = {
  [AppExceptionCode.BAD_REQUEST]: new AppException(
    AppExceptionCode.BAD_REQUEST,
    'Bad request',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.INTERNAL_SERVER_ERROR]: new AppException(
    AppExceptionCode.INTERNAL_SERVER_ERROR,
    'Internal server error',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  [AppExceptionCode.CONCURRENT_OPERATION]: new AppException(
    AppExceptionCode.CONCURRENT_OPERATION,
    'Concurrent operation',
    HttpStatus.CONFLICT,
  ),
  [AppExceptionCode.INVALID_PARAMS]: new AppException(
    AppExceptionCode.INVALID_PARAMS,
    'Invalid params',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_EMAIL_ALREADY_EXISTS]: new AppException(
    AppExceptionCode.USER_EMAIL_ALREADY_EXISTS,
    'User email already exists',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.USER_NOT_FOUND]: new AppException(
    AppExceptionCode.USER_NOT_FOUND,
    'User not found',
    HttpStatus.NOT_FOUND,
  ),
  [AppExceptionCode.USER_PASSWORD_INCORRECT]: new AppException(
    AppExceptionCode.USER_PASSWORD_INCORRECT,
    'Incorrect password',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.USER_NOT_ACTIVE]: new AppException(
    AppExceptionCode.USER_NOT_ACTIVE,
    'User is not active',
    HttpStatus.FORBIDDEN,
  ),
  [AppExceptionCode.USER_NOT_VERIFIED]: new AppException(
    AppExceptionCode.USER_NOT_VERIFIED,
    'User is not verified',
    HttpStatus.FORBIDDEN,
  ),
  [AppExceptionCode.USER_OTP_INCORRECT]: new AppException(
    AppExceptionCode.USER_OTP_INCORRECT,
    'Incorrect OTP',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.USER_OTP_EXPIRED]: new AppException(
    AppExceptionCode.USER_OTP_EXPIRED,
    'OTP has expired',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.USER_OTP_SENT_TO_EMAIL]: new AppException(
    AppExceptionCode.USER_OTP_SENT_TO_EMAIL,
    'OTP sent to email',
    HttpStatus.OK,
  ),
  [AppExceptionCode.USER_ALREADY_ACTIVE]: new AppException(
    AppExceptionCode.USER_ALREADY_ACTIVE,
    'User is already active',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_EMAIL_NOT_VERIFIED]: new AppException(
    AppExceptionCode.USER_EMAIL_NOT_VERIFIED,
    'User email not verified',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.USER_IS_INACTIVE]: new AppException(
    AppExceptionCode.USER_IS_INACTIVE,
    'User is inactive',
    HttpStatus.FORBIDDEN,
  ),

  [AppExceptionCode.USER_COUNTRY_ALREADY_EXISTS]: new AppException(
    AppExceptionCode.USER_COUNTRY_ALREADY_EXISTS,
    'User country already exists',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_REFERRAL_CODE_NOT_FOUND]: new AppException(
    AppExceptionCode.USER_REFERRAL_CODE_NOT_FOUND,
    'User referral code not found',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_WALLET_NOT_FOUND]: new AppException(
    AppExceptionCode.USER_WALLET_NOT_FOUND,
    'User wallet not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.USER_SIGNATURE_INVALID]: new AppException(
    AppExceptionCode.USER_SIGNATURE_INVALID,
    'User signature invalid',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_ADDRESS_ALREADY_EXISTS]: new AppException(
    AppExceptionCode.USER_ADDRESS_ALREADY_EXISTS,
    'User address already exists',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_DISABLED_PURCHASE]: new AppException(
    AppExceptionCode.USER_DISABLED_PURCHASE,
    'User disabled purchase',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_DISABLED_REDEEM]: new AppException(
    AppExceptionCode.USER_DISABLED_REDEEM,
    'User disabled redeem',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_EMAIL_NOT_MATCH]: new AppException(
    AppExceptionCode.USER_EMAIL_NOT_MATCH,
    'User email not match',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_ALREADY_REFERRED]: new AppException(
    AppExceptionCode.USER_ALREADY_REFERRED,
    'User already referred',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_NOT_FIRST_LOGIN]: new AppException(
    AppExceptionCode.USER_NOT_FIRST_LOGIN,
    'User not first login',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.CANNOT_REFER_SELF]: new AppException(
    AppExceptionCode.CANNOT_REFER_SELF,
    'Cannot refer self',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_ALIAS_ALREADY_EXISTS]: new AppException(
    AppExceptionCode.USER_ALIAS_ALREADY_EXISTS,
    'User alias already exists',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.USER_ALIAS_NOT_SET]: new AppException(
    AppExceptionCode.USER_ALIAS_NOT_SET,
    'User alias not set',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.AUTH_INVALID_CREDENTIALS]: new AppException(
    AppExceptionCode.AUTH_INVALID_CREDENTIALS,
    'Invalid credentials',
    HttpStatus.UNAUTHORIZED,
  ),

  // New operator-related exceptions
  [AppExceptionCode.OPERATOR_NOT_ACTIVE]: new AppException(
    AppExceptionCode.OPERATOR_NOT_ACTIVE,
    'Operator is not active',
    HttpStatus.FORBIDDEN,
  ),
  [AppExceptionCode.OPERATOR_NOT_FOUND]: new AppException(
    AppExceptionCode.OPERATOR_NOT_FOUND,
    'Operator not found',
    HttpStatus.NOT_FOUND,
  ),
  [AppExceptionCode.OPERATOR_ALREADY_ACTIVE]: new AppException(
    AppExceptionCode.OPERATOR_ALREADY_ACTIVE,
    'Operator is already active',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.OPERATOR_OTP_INCORRECT]: new AppException(
    AppExceptionCode.OPERATOR_OTP_INCORRECT,
    'Incorrect OTP for operator',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.OPERATOR_PASSWORD_INCORRECT]: new AppException(
    AppExceptionCode.OPERATOR_PASSWORD_INCORRECT,
    'Incorrect password for operator',
    HttpStatus.BAD_REQUEST,
  ),
  [AppExceptionCode.OPERATOR_NOT_AUTHORIZED]: new AppException(
    AppExceptionCode.OPERATOR_NOT_AUTHORIZED,
    'Operator is not authorized',
    HttpStatus.FORBIDDEN,
  ),

  // Card exception

  [AppExceptionCode.CARD_NOT_FOUND]: new AppException(
    AppExceptionCode.CARD_NOT_FOUND,
    'Card not found',
    HttpStatus.NOT_FOUND,
  ),
  [AppExceptionCode.CARD_CREATION_FAILED]: new AppException(
    AppExceptionCode.CARD_CREATION_FAILED,
    'Failed to create card',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  [AppExceptionCode.CARD_UPDATE_FAILED]: new AppException(
    AppExceptionCode.CARD_UPDATE_FAILED,
    'Failed to update card',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),
  [AppExceptionCode.CARD_DELETION_FAILED]: new AppException(
    AppExceptionCode.CARD_DELETION_FAILED,
    'Failed to delete card',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.CARD_DISCOUNT_NOT_FOUND]: new AppException(
    AppExceptionCode.CARD_DISCOUNT_NOT_FOUND,
    'Card discount not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.CARD_PRICE_NOT_SUPPORTED]: new AppException(
    AppExceptionCode.CARD_PRICE_NOT_SUPPORTED,
    'Card price not supported',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.CARD_MAX_OWNED]: new AppException(
    AppExceptionCode.CARD_MAX_OWNED,
    'Card max owned',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.CARD_ALREADY_REDEEMED]: new AppException(
    AppExceptionCode.CARD_ALREADY_REDEEMED,
    'Some cards have been redeemed',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.CARD_ORDER_NOT_COMPLETED]: new AppException(
    AppExceptionCode.CARD_ORDER_NOT_COMPLETED,
    'Card order not completed',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.CARD_ORDER_NOT_FOUND]: new AppException(
    AppExceptionCode.CARD_ORDER_NOT_FOUND,
    'Card order not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.CARD_IDS_PROVIDED_IS_INVALID]: new AppException(
    AppExceptionCode.CARD_IDS_PROVIDED_IS_INVALID,
    'Card ids provided is invalid',
    HttpStatus.BAD_REQUEST,
  ),

  // User balance exception

  [AppExceptionCode.INSUFFICIENT_BALANCE]: new AppException(
    AppExceptionCode.INSUFFICIENT_BALANCE,
    'Insufficient balance',
    HttpStatus.BAD_REQUEST,
  ),

  // Fireblocks exceptions

  [AppExceptionCode.FIREBLOCKS_CREATE_VAULT_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_CREATE_VAULT_FAILED,
    'Failed to create vault',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_CREATE_ASSET_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_CREATE_ASSET_FAILED,
    'Failed to create asset',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_CREATE_INTERNAL_WALLET_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_CREATE_INTERNAL_WALLET_FAILED,
    'Failed to create internal wallet',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_UPDATE_INTERNAL_WALLET_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_UPDATE_INTERNAL_WALLET_FAILED,
    'Failed to update internal wallet',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_DELETE_INTERNAL_WALLET_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_DELETE_INTERNAL_WALLET_FAILED,
    'Failed to delete internal wallet',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_CREATE_EXTERNAL_WALLET_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_CREATE_EXTERNAL_WALLET_FAILED,
    'Failed to create external wallet',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_VAULT_NOT_FOUND]: new AppException(
    AppExceptionCode.FIREBLOCKS_VAULT_NOT_FOUND,
    'Vault not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.FIREBLOCKS_INTERNAL_WALLET_NOT_FOUND]: new AppException(
    AppExceptionCode.FIREBLOCKS_INTERNAL_WALLET_NOT_FOUND,
    'Internal wallet not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.FIREBLOCKS_EXTERNAL_WALLET_NOT_FOUND]: new AppException(
    AppExceptionCode.FIREBLOCKS_EXTERNAL_WALLET_NOT_FOUND,
    'External wallet not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.FIREBLOCKS_CREATE_TRANSACTION_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_CREATE_TRANSACTION_FAILED,
    'Failed to create transaction',
    HttpStatus.INTERNAL_SERVER_ERROR,
    'Failed to create transaction',
  ),

  [AppExceptionCode.FIREBLOCKS_ESTIMATE_NETWORK_FEE_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_ESTIMATE_NETWORK_FEE_FAILED,
    'Failed to estimate network fee',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_GET_GAS_STATION_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_GET_GAS_STATION_FAILED,
    'Failed to get gas station',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_GET_PAGED_VAULT_ACCOUNTS_FAILED]:
    new AppException(
      AppExceptionCode.FIREBLOCKS_GET_PAGED_VAULT_ACCOUNTS_FAILED,
      'Failed to get paged vault accounts',
      HttpStatus.INTERNAL_SERVER_ERROR,
    ),

  [AppExceptionCode.FIREBLOCKS_GET_ASSET_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_GET_ASSET_FAILED,
    'Failed to get asset',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.FIREBLOCKS_GET_ASSET_ADDRESSES_FAILED]: new AppException(
    AppExceptionCode.FIREBLOCKS_GET_ASSET_ADDRESSES_FAILED,
    'Failed to get asset addresses',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.ASSET_TOKEN_NOT_FOUND]: new AppException(
    AppExceptionCode.ASSET_TOKEN_NOT_FOUND,
    'Asset token not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.COUNTRY_NOT_FOUND]: new AppException(
    AppExceptionCode.COUNTRY_NOT_FOUND,
    'Country not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.COUNTRY_BLACKLISTED]: new AppException(
    AppExceptionCode.COUNTRY_BLACKLISTED,
    'Country blacklisted',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.INSUFFICIENT_REWARD]: new AppException(
    AppExceptionCode.INSUFFICIENT_REWARD,
    'Insufficient reward',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.NETWORK_NOT_FOUND]: new AppException(
    AppExceptionCode.NETWORK_NOT_FOUND,
    'Network not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.NETWORK_NOT_SUPPORTED]: new AppException(
    AppExceptionCode.NETWORK_NOT_SUPPORTED,
    'Network not supported',
    HttpStatus.BAD_REQUEST,
  ),

  [AppExceptionCode.SYSTEM_CONFIG_NOT_FOUND]: new AppException(
    AppExceptionCode.SYSTEM_CONFIG_NOT_FOUND,
    'System config not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.WITHDRAW_TRANSACTION_FAILED]: new AppException(
    AppExceptionCode.WITHDRAW_TRANSACTION_FAILED,
    'Withdraw transaction failed',
    HttpStatus.INTERNAL_SERVER_ERROR,
  ),

  [AppExceptionCode.USER_REFERRAL_NOT_FOUND]: new AppException(
    AppExceptionCode.USER_REFERRAL_NOT_FOUND,
    'User referral not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.CART_NOT_FOUND]: new AppException(
    AppExceptionCode.CART_NOT_FOUND,
    'Cart not found',
    HttpStatus.NOT_FOUND,
  ),

  [AppExceptionCode.CART_ITEM_NOT_FOUND]: new AppException(
    AppExceptionCode.CART_ITEM_NOT_FOUND,
    'Cart item not found',
    HttpStatus.NOT_FOUND,
  ),
};

export const getAppException = (
  code: AppExceptionCode,
  details?: string | Record<string, any>,
): AppException => {
  const exception =
    AppExceptions[code] ||
    AppExceptions[AppExceptionCode.INTERNAL_SERVER_ERROR];

  if (details) {
    return exception.wrapError(details);
  }

  return exception;
};
