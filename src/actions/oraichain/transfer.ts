import type { OraichainAgentKit } from "../../agent";
import { z } from "zod";
import type { Action as OraichainAction } from "../../types/oraichainAction";

const oraichainTokenTransferAction: OraichainAction = {
  name: "TOKEN_TRANSFER_ACTION",
  similes: [
    "transfer token of x amount, y denom to a wallet",
    "send x amount of y denom to a address",
    "transfer x to this address",
    "transfer x to this recipient",
  ],
  description: `Transfer a token with an amount to a recipient address.`,
  examples: [
    [
      {
        input: {
          senderAddress: "orai1f5nyvnx5ks738d5ys7pwa0evc42v6ff043h6d2",
          recipient: "orai1f5nyvnx5ks738d5ys7pwa0evc42v6ff043h6d2",
          amount: {
            amount: "100",
            denom: "orai",
          },
        },
        output: {
          status: "success",
          data: {
            typeUrl: "/cosmos.bank.v1beta1.MsgSend",
            value: {
              fromAddress: "orai1f5nyvnx5ks738d5ys7pwa0evc42v6ff043h6d2",
              toAddress: "orai1f5nyvnx5ks738d5ys7pwa0evc42v6ff043h6d2",
              amount: [{ denom: "orai", amount: "100" }],
            },
          },
        },
        explanation: "Transfer 100 ORAI to the wallet",
      },
    ],
  ],
  schema: z.object({
    senderAddress: z.string().describe("The sender address"),
    recipient: z.string().describe("The recipient address"),
    amount: z.object({
      amount: z.string().describe("The amount of tokens to transfer"),
      denom: z.string().describe("The denom of the token to transfer"),
    }),
  }),
  handler: async (agent: OraichainAgentKit, input) => {
    const message = await agent.transfer(
      input.senderAddress,
      input.recipient,
      input.amount,
    );

    return {
      status: "success",
      data: message,
    };
  },
};

export default oraichainTokenTransferAction;
