import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet } from "@cosmjs/proto-signing";
import { Coin, GasPrice } from "@cosmjs/stargate";
import { getBalance } from "../tools/oraichain";
import { ORAI } from "@oraichain/common";
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
  ) {}

  static async connect(rpcUrl: string, mnemonic: string) {
    console.log("Connecting to Oraichain...", rpcUrl, mnemonic);
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: ORAI,
    });
    const client = await SigningCosmWasmClient.connectWithSigner(
      rpcUrl,
      wallet,
      { gasPrice: GasPrice.fromString("0.001" + ORAI) },
    );
    return new OraichainAgentKit(wallet, client);
  }

  async getBalance(address: string, denom: string) {
    return await getBalance(this, denom, address);
  }
}
