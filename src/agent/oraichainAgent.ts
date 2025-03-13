import {
  CosmWasmClient,
  createWasmAminoConverters,
  setupWasmExtension,
  SigningCosmWasmClient,
  WasmExtension,
  wasmTypes,
} from "@cosmjs/cosmwasm-stargate";
import { makeAuthInfoBytes, Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  BankExtension,
  Coin,
  createDefaultAminoConverters,
  defaultRegistryTypes,
  MintExtension,
  QueryClient,
  setupBankExtension,
  setupMintExtension,
  setupStakingExtension,
  StakingExtension,
} from "@cosmjs/stargate";
import { Binary } from "@oraichain/common";
import { Comet38Client } from "@cosmjs/tendermint-rpc";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";
import { StdSignDoc, StdSignature } from "@cosmjs/amino";
import { SignMode } from "cosmjs-types/cosmos/tx/signing/v1beta1/signing";
import { Any } from "cosmjs-types/google/protobuf/any";
import { Int53 } from "@cosmjs/math";
import { PubKey } from "cosmjs-types/cosmos/crypto/secp256k1/keys";
import { fromBase64 } from "@cosmjs/encoding";

type PubkeyType =
  | "/ethermint.crypto.v1.ethsecp256k1.PubKey" // for ethermint txs
  | "/cosmos.crypto.secp256k1.PubKey"; // for cosmos txs

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
    public readonly registry = new Registry([
      ...defaultRegistryTypes,
      ...wasmTypes,
    ]),
    public readonly aminoTypes = new AminoTypes({
      ...createDefaultAminoConverters(),
      ...createWasmAminoConverters(),
    }),
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

  /**
   * Submit a transaction to the blockchain
   * @param signedTx - Transaction to submit, in base64 format
   * @returns
   */
  async broadcastTxSync(signedTx: Binary) {
    return this.client.broadcastTxSync(fromBase64(signedTx));
  }

  /**
   * Broadcast a transaction to the blockchain
   * @param signedBodyBytes - Transaction body, in base64 format
   * @param signedAuthBytes - Transaction auth info, in base64 format
   * @param signature - Signature for the transaction, in base64 format
   */
  async broadcastTxSyncFromDirectSignDocAndSignature(
    signedBodyBytes: Binary,
    signedAuthBytes: Binary,
    signatures: Binary[],
  ) {
    const txRaw = TxRaw.fromPartial({
      bodyBytes: fromBase64(signedBodyBytes),
      authInfoBytes: fromBase64(signedAuthBytes),
      signatures: signatures.map((sig) => fromBase64(sig)),
    });
    const txBytes = TxRaw.encode(txRaw).finish();
    return this.client.broadcastTxSync(txBytes);
  }

  /**
   * Broadcast a transaction to the blockchain
   * @param signDoc - Transaction sign doc, in base64 format
   * @param signature - Signature for the transaction, in base64 format
   */
  async broadcastTxSyncFromStdSignDocAndSignature(
    signedDoc: StdSignDoc,
    signature: StdSignature,
    pubkeyType: PubkeyType = "/cosmos.crypto.secp256k1.PubKey",
  ) {
    const signedTxBody = {
      messages: signedDoc.msgs.map((msg) => this.aminoTypes.fromAmino(msg)),
      memo: signedDoc.memo,
    };
    const signedTxBodyEncodeObject = {
      typeUrl: "/cosmos.tx.v1beta1.TxBody",
      value: signedTxBody,
    };
    const signedTxBodyBytes = this.registry.encode(signedTxBodyEncodeObject);
    const signedGasLimit = Int53.fromString(signedDoc.fee.gas).toNumber();
    const signedSequence = Int53.fromString(signedDoc.sequence).toNumber();
    const pubkey = Any.fromPartial({
      typeUrl: pubkeyType,
      value: PubKey.encode({
        key: fromBase64(signature.pub_key.value),
      }).finish(),
    });
    const signedAuthInfoBytes = makeAuthInfoBytes(
      [{ pubkey: pubkey, sequence: signedSequence }],
      signedDoc.fee.amount,
      signedGasLimit,
      signedDoc.fee.granter,
      signedDoc.fee.payer,
      SignMode.SIGN_MODE_LEGACY_AMINO_JSON,
    );
    const txRaw = TxRaw.fromPartial({
      bodyBytes: signedTxBodyBytes,
      authInfoBytes: signedAuthInfoBytes,
      signatures: [fromBase64(signature.signature)],
    });
    const txBytes = TxRaw.encode(txRaw).finish();
    return this.client.broadcastTxSync(txBytes);
  }
}
