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
        input: {},
        output: {
          status: "success",
          data: {
            recipent: "orai1f5nyvnx5ks738d5ys7pwa0evc42v6ff043h6d2",
            amount: {
              amount: "100",
              denom: "orai",
            },
            transactionHash:
              "21C01CA4F468898CC1288844E3F7287C2CBA7F529AB57294F1FCAF11FACC695E",
          },
        },
        explanation: "Transfer 100 ORAI to the wallet",
      },
    ],
  ],
  schema: z.object({
    recipient: z.string().describe("The recipient address"),
    amount: z.object({
      amount: z.string().describe("The amount of tokens to transfer"),
      denom: z.string().describe("The denom of the token to transfer"),
    }),
  }),
  handler: async (agent: OraichainAgentKit, input) => {
    const transactionHash = await agent.transfer(input.recipient, input.amount);

    return {
      status: "success",
      data: {
        recipent: input.recipient,
        amount: input.amount,
        transactionHash,
      },
    };
  },
};

export default oraichainTokenTransferAction;
