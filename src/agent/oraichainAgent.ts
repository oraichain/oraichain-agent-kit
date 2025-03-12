import {
  CosmWasmClient,
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
    public readonly client: CosmWasmClient,
    public readonly queryClient: QueryClient &
      BankExtension &
      StakingExtension &
      WasmExtension &
      MintExtension,
  ) {}

  static async connect(rpcUrl: string) {
    const client = await SigningCosmWasmClient.connect(rpcUrl);
    const comet = await Comet38Client.connect(rpcUrl);
    const queryClient = QueryClient.withExtensions(
      comet,
      setupBankExtension,
      setupStakingExtension,
      setupWasmExtension,
      setupMintExtension,
    );
    return new OraichainAgentKit(client, queryClient);
  }

  async getBalance(address: string, denom: string) {
    return this.client.getBalance(address, denom);
  }

  async getDelegation(address: string, validatorAddress: string) {
    return this.queryClient.staking.delegation(address, validatorAddress);
  }

  async transfer(senderAddress: string, toAddress: string, amount: Coin) {
    return {
      typeUrl: "/cosmos.bank.v1beta1.MsgSend",
      value: {
        fromAddress: senderAddress,
        toAddress,
        amount: [amount],
      },
    };
  }
}
