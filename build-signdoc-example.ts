import {
  createWasmAminoConverters,
  SigningCosmWasmClient,
  wasmTypes,
} from "@cosmjs/cosmwasm-stargate";
import { DirectSecp256k1HdWallet, Registry } from "@cosmjs/proto-signing";
import {
  AminoTypes,
  Coin,
  createDefaultAminoConverters,
  defaultRegistryTypes,
  GasPrice,
} from "@cosmjs/stargate";
import { makeSignDoc, Secp256k1HdWallet, StdSignDoc } from "@cosmjs/amino";
import { toBase64 } from "@cosmjs/encoding";
import { TxRaw } from "cosmjs-types/cosmos/tx/v1beta1/tx";

/**
 * This example demonstrates how to build a signDoc from a senderAddress in Oraichain
 * 
 * There are two main approaches:
 * 1. Using DirectSecp256k1HdWallet (Direct signing)
 * 2. Using Secp256k1HdWallet (Amino signing)
 */

// Replace these values with your own
const MNEMONIC = "your mnemonic phrase here";
const RPC_URL = "https://rpc.orai.io"; // Oraichain RPC URL
const SENDER_ADDRESS = "orai1..."; // Your Oraichain address
const RECIPIENT_ADDRESS = "orai1..."; // Recipient address
const AMOUNT = "1"; // Amount to send
const DENOM = "orai"; // Token denomination

async function buildSignDocWithDirectSigning() {
  console.log("Building signDoc with Direct signing approach");
  
  // 1. Setup wallet
  const wallet = await DirectSecp256k1HdWallet.fromMnemonic(MNEMONIC, {
    prefix: "orai",
  });
  const accounts = await wallet.getAccounts();
  
  // 2. Setup client
  const client = await SigningCosmWasmClient.connectWithSigner(
    RPC_URL,
    wallet,
    {
      gasPrice: GasPrice.fromString("0.0001orai"),
      registry: new Registry([...defaultRegistryTypes, ...wasmTypes]),
    },
  );
  
  // 3. Create transfer message
  const transferMessage = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: accounts[0].address,
      toAddress: RECIPIENT_ADDRESS,
      amount: [{ denom: DENOM, amount: AMOUNT }],
    },
  };
  
  // 4. Sign the transaction
  // This creates a complete signed transaction
  const txRaw = await client.sign(
    accounts[0].address,
    [transferMessage],
    { amount: [{ amount: "0", denom: DENOM }], gas: "20000000" },
    "", // memo
  );
  
  // 5. The signed transaction contains the signDoc components
  console.log("Signed transaction components:");
  console.log("- bodyBytes (base64):", toBase64(txRaw.bodyBytes));
  console.log("- authInfoBytes (base64):", toBase64(txRaw.authInfoBytes));
  console.log(
    "- signatures (base64):",
    txRaw.signatures.map((sig) => toBase64(sig)),
  );
  
  // 6. Encode the transaction for broadcasting
  const txBytes = TxRaw.encode(txRaw).finish();
  console.log("- Complete encoded transaction (base64):", toBase64(txBytes));
  
  return txRaw;
}

async function buildSignDocWithAminoSigning() {
  console.log("\nBuilding signDoc with Amino signing approach");
  
  // 1. Setup wallet
  const wallet = await Secp256k1HdWallet.fromMnemonic(MNEMONIC, {
    prefix: "orai",
  });
  const accounts = await wallet.getAccounts();
  
  // 2. Setup client
  const client = await SigningCosmWasmClient.connectWithSigner(
    RPC_URL,
    wallet,
    {
      gasPrice: GasPrice.fromString("0.0001orai"),
      registry: new Registry([...defaultRegistryTypes, ...wasmTypes]),
    },
  );
  
  // 3. Create transfer message
  const transferMessage = {
    typeUrl: "/cosmos.bank.v1beta1.MsgSend",
    value: {
      fromAddress: accounts[0].address,
      toAddress: RECIPIENT_ADDRESS,
      amount: [{ denom: DENOM, amount: AMOUNT }],
    },
  };
  
  // 4. Get account sequence and chain ID
  const { accountNumber, sequence } = await client.getSequence(accounts[0].address);
  const chainId = await client.getChainId();
  
  // 5. Convert the message to Amino format
  const aminoTypes = new AminoTypes({
    ...createDefaultAminoConverters(),
    ...createWasmAminoConverters(),
  });
  const aminoMsg = aminoTypes.toAmino(transferMessage);
  
  // 6. Create the signDoc
  // This is the key step - creating a StdSignDoc from the sender address and message
  const signDoc = makeSignDoc(
    [aminoMsg], // messages in amino format
    { amount: [{ amount: "0", denom: DENOM }], gas: "20000000" }, // fee
    chainId,
    "", // memo
    accountNumber,
    sequence
  );
  
  // 7. Sign the document
  const { signed, signature } = await wallet.signAmino(accounts[0].address, signDoc);
  
  console.log("StdSignDoc:", JSON.stringify(signed, null, 2));
  console.log("Signature:", JSON.stringify(signature, null, 2));
  
  return { signDoc: signed, signature };
}

/**
 * Main function to demonstrate both approaches
 */
async function main() {
  try {
    // Approach 1: Direct signing
    const directSignedTx = await buildSignDocWithDirectSigning();
    
    // Approach 2: Amino signing
    const { signDoc, signature } = await buildSignDocWithAminoSigning();
    
    console.log("\nBoth approaches have successfully built signDocs from a sender address.");
    console.log("You can now broadcast these transactions to the network.");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the example
main(); 