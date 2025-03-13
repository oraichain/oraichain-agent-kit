import type { OraichainAgentKit } from "../../agent";
import { number, z } from "zod";
import type { Action as OraichainAction } from "../../types/oraichainAction";

const oraichainBroadcastSignedTx: OraichainAction = {
  name: "BROADCAST_SIGNED_TX_ACTION",
  similes: [
    "Broadcast a signed transaction to the network",
    "Submit a signed transaction to the network",
  ],
  description: `Broadcast a signed transaction to the network.`,
  examples: [
    [
      {
        input: {
          signedTx: "H8aPafD2lbd/8bwP4jmhfa0YhkCXS6TcJFt2ebUWa8Y=",
        },
        output: {
          status: "success",
          data: {
            txHash: "H8aPafD2lbd/8bwP4jmhfa0YhkCXS6TcJFt2ebUWa8Y=",
          },
        },
        explanation: "Transfer 100 ORAI to the wallet",
      },
    ],
  ],
  schema: z.object({
    signedTx: z.string().describe("The signed transaction in base64 format"),
  }),
  handler: async (agent: OraichainAgentKit, input) => {
    const txHash = await agent.broadcastTxSync(input.signedTx);

    return {
      status: "success",
      data: {
        txHash,
      },
    };
  },
};

const oraichainBroadcastSignedTxFromSignedBytesAndSignature: OraichainAction = {
  name: "BROADCAST_SIGNED_TX_FROM_SIGNED_BYTES_AND_SIGNATURE_ACTION",
  similes: [
    "Broadcast a signed transaction to the network from signed body bytes, auth bytes and signature",
    "Submit a signed transaction to the network from signed data",
  ],
  description: `Broadcast a signed transaction to the network using signed body bytes, auth bytes and signature.`,
  examples: [],
  schema: z.object({
    signedBodyBytes: z
      .string()
      .describe("The signed transaction body in base64 format"),
    signedAuthBytes: z
      .string()
      .describe("The signed transaction auth info in base64 format"),
    signatures: z.array(
      z
        .string()
        .describe("The signatures for the transaction in base64 format"),
    ),
  }),
  handler: async (agent: OraichainAgentKit, input) => {
    const txHash = await agent.broadcastTxSyncFromDirectSignDocAndSignature(
      input.signedBodyBytes,
      input.signedAuthBytes,
      input.signatures,
    );

    return {
      status: "success",
      data: {
        txHash,
      },
    };
  },
};
const oraichainBroadcastSignedTxFromStdDocAndSignature: OraichainAction = {
  name: "BROADCAST_SIGNED_TX_FROM_STD_SIGNDOC_AND_SIGNATURE_ACTION",
  similes: [
    "Broadcast a signed transaction to the network from signed std sign doc and signature",
    "Submit a signed transaction to the network from signed std data and signature",
  ],
  description: `Broadcast a signed transaction to the network using signed std sign doc and signature.`,
  examples: [],
  schema: z.object({
    signedDoc: z.object({
      chain_id: z.string().describe("The chain id"),
      account_number: z.string().or(z.number()).describe("The account number"),
      sequence: z.string().or(z.number()).describe("The sequence number"),
      fee: z.object({
        amount: z.array(
          z.object({
            denom: z.string().describe("The denom of the fee"),
            amount: z.string().describe("The amount of the fee"),
          }),
        ),
        gas: z.string().describe("The gas for the transaction"),
        granter: z.string().optional().describe("The granter of the fee"),
        payer: z.string().optional().describe("The grantee of the fee"),
      }),
      msgs: z.array(
        z.object({
          type: z.string().describe("The type of the message"),
          value: z
            .any()
            .describe("The value of the message, in cosmos amino format"),
        }),
      ),
      memo: z.string().describe("The memo for the transaction"),
      timeout_height: z
        .string()
        .optional()
        .describe("The timeout height for the transaction"),
    }),
    signature: z
      .object({
        pub_key: z.object({
          type: z.string().describe("The type of the pubkey"),
          value: z.any().describe("The value of the pubkey in base64 format"),
        }),
        signature: z
          .string()
          .describe("The signature for the transaction in base64 format"),
      })
      .describe("The signature for the transaction in base64 format"),
  }),
  handler: async (agent: OraichainAgentKit, input) => {
    const txHash = await agent.broadcastTxSyncFromStdSignDocAndSignature(
      input.signedDoc,
      input.signature,
    );

    return {
      status: "success",
      data: {
        txHash,
      },
    };
  },
};
export {
  oraichainBroadcastSignedTx,
  oraichainBroadcastSignedTxFromSignedBytesAndSignature,
  oraichainBroadcastSignedTxFromStdDocAndSignature,
};
