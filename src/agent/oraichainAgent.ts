import {
  setupWasmExtension,
  SigningCosmWasmClient,
  WasmExtension,
} from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import {
  BankExtension,
  Coin,
  GasPrice,
  MintExtension,
  QueryClient,
  setupBankExtension,
  setupMintExtension,
  setupStakingExtension,
  StakingExtension,
} from "@cosmjs/stargate";
import { ORAI } from "@oraichain/common";
import { Comet38Client } from "@cosmjs/tendermint-rpc";
/**
 * Main class for interacting with Oraichain blockchain
 * Provides a unified interface for token operations, NFT management, trading and more
 *
 * @class OraichainAgentKit
 * @property {DirectSecp256k1HdWallet} wallet - Wallet instance for signing transactions
 * @property {SigningCosmWasmClient} client - Client instance for interacting with the blockchain
 */
export class OraichainAgentKit {
  private constructor(
    public readonly wallet: DirectSecp256k1HdWallet,
    public readonly client: SigningCosmWasmClient,
    public readonly queryClient: QueryClient &
      BankExtension &
      StakingExtension &
      WasmExtension &
      MintExtension,
  ) {}

  static async connect(rpcUrl: string, mnemonic: string) {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: ORAI,
    });
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcUrl,
      wallet,
      { gasPrice: GasPrice.fromString("0.001" + ORAI) },
    );
    const comet = await Comet38Client.connect(rpcUrl);
    const queryClient = QueryClient.withExtensions(
      comet,
      setupBankExtension,
      setupStakingExtension,
      setupWasmExtension,
      setupMintExtension,
    );
    return new OraichainAgentKit(wallet, client, queryClient);
  }

  async getBalance(address: string, denom: string) {
    return this.client.getBalance(address, denom);
  }

  async getDelegation(address: string, validatorAddress: string) {
    return this.queryClient.staking.delegation(address, validatorAddress);
  }

  async transfer(
    toAddress: string,
    amount: Coin,
    fromAccountIndex: number = 0,
  ) {
    const wallet = await this.wallet.getAccounts();
    const result = await this.client.sendTokens(
      wallet[fromAccountIndex].address,
      toAddress,
      [amount],
      "auto",
    );
    return result.transactionHash;
  }
}
