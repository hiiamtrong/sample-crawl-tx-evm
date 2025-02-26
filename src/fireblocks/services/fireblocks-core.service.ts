import { Fireblocks, VaultAccount } from '@fireblocks/ts-sdk';
import { VaultsApiGetPagedVaultAccountsRequest } from '@fireblocks/ts-sdk/api/vaults-api';
import { GetTransactionOperation } from '@fireblocks/ts-sdk/dist/models/get-transaction-operation';
import {
  TransactionRequest,
  VaultAccountsPagedResponse,
} from '@fireblocks/ts-sdk/models';
import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { FIREBLOCKS_SDK } from 'src/fireblocks/fireblocks.constant';
import {
  AppExceptionCode,
  getAppException,
} from 'src/shared/exceptions/app.exception';
import { AppLogger } from 'src/shared/logger/logger.service';
import { RequestContext } from 'src/shared/request-context/request-context.dto';

@Injectable()
export class FireblocksCoreService {
  constructor(
    @Inject(FIREBLOCKS_SDK) private readonly fireblocks: Fireblocks,
    private readonly logger: AppLogger,
  ) {
    this.logger.setContext(FireblocksCoreService.name);
  }

  async createVault(ctx: RequestContext, { userId, name }) {
    const resp = await this.fireblocks.vaults.createVaultAccount({
      createVaultAccountRequest: {
        name,
        hiddenOnUI: false,
        autoFuel: true,
        customerRefId: userId.toString(),
      },
    });

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Create vault failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_CREATE_VAULT_FAILED,
        resp,
      );
    }

    return resp.data;
  }

  async createInternalWallet(ctx: RequestContext, { userId, name }) {
    const resp = await this.fireblocks.internalWallets.createInternalWallet({
      createWalletRequest: {
        name,
        customerRefId: userId.toString(),
      },
    });

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Create internal wallet failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_CREATE_INTERNAL_WALLET_FAILED,
        resp,
      );
    }

    return resp.data;
  }

  async createInternalWalletAsset(
    ctx: RequestContext,
    { assetId, walletId, address },
  ) {
    const resp =
      await this.fireblocks.internalWallets.createInternalWalletAsset({
        assetId,
        walletId,
        createInternalWalletAssetRequest: {
          address,
        },
      });

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Create internal wallet asset failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_CREATE_INTERNAL_WALLET_FAILED,
        resp,
      );
    }

    return resp.data;
  }

  async updateInternalWalletAsset(
    ctx: RequestContext,
    { assetId, walletId, address },
  ) {
    const resp =
      await this.fireblocks.internalWallets.deleteInternalWalletAsset({
        assetId,
        walletId,
      });

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Update internal wallet asset failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_UPDATE_INTERNAL_WALLET_FAILED,
        resp,
      );
    }

    const resp2 =
      await this.fireblocks.internalWallets.createInternalWalletAsset({
        assetId,
        walletId,
        createInternalWalletAssetRequest: {
          address,
        },
      });

    if (resp2.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Create internal wallet asset failed: ', resp2);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_CREATE_INTERNAL_WALLET_FAILED,
        resp2,
      );
    }

    return resp2.data;
  }

  async createAsset(ctx: RequestContext, { vaultAccountId, assetId }) {
    const resp = await this.fireblocks.vaults.createVaultAccountAsset({
      assetId,
      vaultAccountId,
    });

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Create asset failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_CREATE_ASSET_FAILED,
        resp,
      );
    }

    return resp.data;
  }

  async getAsset(ctx: RequestContext, { vaultAccountId, assetId }) {
    try {
      const resp = await this.fireblocks.vaults.getVaultAccountAsset({
        assetId,
        vaultAccountId,
      });

      if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
        this.logger.error(ctx, 'Get asset failed: ', resp);
        throw getAppException(
          AppExceptionCode.FIREBLOCKS_GET_ASSET_FAILED,
          resp,
        );
      }

      return resp.data;
    } catch (e) {
      if (e.response?.statusCode === HttpStatus.NOT_FOUND) {
        return null;
      }
      throw e;
    }
  }

  async getAssetAddresses(ctx: RequestContext, { vaultAccountId, assetId }) {
    const resp =
      await this.fireblocks.vaults.getVaultAccountAssetAddressesPaginated({
        assetId,
        vaultAccountId,
      });

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Get asset addresses failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_GET_ASSET_ADDRESSES_FAILED,
        resp,
      );
    }

    return resp.data;
  }

  async createTransaction(ctx: RequestContext, request: TransactionRequest) {
    try {
      const {
        operation,
        source,
        destination,
        amount,
        assetId,
        note,
        externalTxId,
      } = request;
      const resp = await this.fireblocks.transactions.createTransaction({
        transactionRequest: {
          operation: operation || GetTransactionOperation.Transfer,
          source,
          destination,
          amount,
          assetId,
          note,
          externalTxId,
          treatAsGrossAmount: true,
        },
      });

      if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
        this.logger.error(ctx, 'Create transaction failed: ', resp);
        throw getAppException(
          AppExceptionCode.FIREBLOCKS_CREATE_TRANSACTION_FAILED,
          resp,
        );
      }

      return resp.data;
    } catch (e) {
      this.logger.error(ctx, 'Create transaction failed: ', e);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_CREATE_TRANSACTION_FAILED,
        e,
      );
    }
  }

  async estimateNetworkFee(ctx: RequestContext, { assetId }) {
    const resp = await this.fireblocks.transactions.estimateNetworkFee({
      assetId,
    });

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Estimate network fee failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_ESTIMATE_NETWORK_FEE_FAILED,
        resp,
      );
    }

    return resp.data;
  }

  async getPagedVaultAccounts(
    ctx: RequestContext,
    { namePrefix, assetId, minAmountThreshold },
  ): Promise<VaultAccount[]> {
    try {
      const getVaults = async (
        request: VaultsApiGetPagedVaultAccountsRequest,
      ): Promise<VaultAccountsPagedResponse> => {
        try {
          const resp =
            await this.fireblocks.vaults.getPagedVaultAccounts(request);

          if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
            this.logger.error(
              ctx,
              'Get paged vault accounts failed: ',
              resp.data,
            );
            throw getAppException(
              AppExceptionCode.FIREBLOCKS_GET_PAGED_VAULT_ACCOUNTS_FAILED,
              resp.data,
            );
          }
          return resp.data;
        } catch (e) {
          this.logger.error(ctx, 'Get paged vault accounts failed: ', e);
          throw getAppException(
            AppExceptionCode.FIREBLOCKS_GET_PAGED_VAULT_ACCOUNTS_FAILED,
            e,
          );
        }
      };

      const vaults = [];
      let after = null;

      while (true) {
        const request: any = {
          namePrefix,
          assetId,
          minAmountThreshold,
        };

        if (after) {
          request.after = after;
        }

        const resp = await getVaults(request);

        if (resp.accounts.length === 0) {
          break;
        }

        vaults.push(...resp.accounts);
        after = resp.paging.after;

        if (!resp.paging.after) {
          break;
        }
      }

      return vaults;
    } catch (e) {
      // tslint:disable-next-line:no-shadowed-variable
      this.logger.error(ctx, 'Get paged vault accounts failed: ', e);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_GET_PAGED_VAULT_ACCOUNTS_FAILED,
        e,
      );
    }
  }

  async getGasStationConfig(ctx: RequestContext) {
    const resp = await this.fireblocks.gasStations.getGasStationInfo();

    if (resp.statusCode >= HttpStatus.BAD_REQUEST) {
      this.logger.error(ctx, 'Get gas station failed: ', resp);
      throw getAppException(
        AppExceptionCode.FIREBLOCKS_GET_GAS_STATION_FAILED,
        resp,
      );
    }
    return resp.data;
  }
}
