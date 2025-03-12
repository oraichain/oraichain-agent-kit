import type { OraichainAgentKit } from "../../agent";
import { z } from "zod";
import type { Action as OraichainAction } from "../../types/oraichainAction";

export const oraichainTokenBalancesAction: OraichainAction = {
  name: "TOKEN_BALANCE_ACTION",
  similes: [
    "check wallet balance of native token denom",
    "get wallet balance of native token denom",
    "view wallet balance of native token denom",
    "show wallet balance of native token denom",
    "check wallet balance of native token denom",
    "what is the wallet balance given denom",
  ],
  description: `Get the Oraichain's wallet balance of a denom.`,
  examples: [
    [
      {
        input: {
          address: "orai14h0n2nlfrfz8tn9usfyjrxqd23fhj9a0ec0pm7",
          denom: "orai",
        },
        output: {
          status: "success",
          address: "orai14h0n2nlfrfz8tn9usfyjrxqd23fhj9a0ec0pm7",
          balance: {
            denom: "orai",
            amount: "1",
          },
        },
        explanation: "Get wallet's balance of a native denom",
      },
    ],
    [
      {
        input: {
          address: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
          denom: "foobar",
        },
        output: {
          status: "success",
          address: "orai1ehmhqcn8erf3dgavrca69zgp4rtxj5kqgtcnyd",
          balance: {
            denom: "foobar",
            amount: "1000",
          },
        },
        explanation: "show wallet balance of native token denom",
      },
    ],
  ],
  schema: z.object({
    address: z.string().describe("The address of the wallet"),
    denom: z.string().describe("The denom of the token"),
  }),
  handler: async (agent: OraichainAgentKit, input) => {
    const balance = await agent.getBalance(input.address, input.denom);

    return {
      status: "success",
      address: input.address,
      balance,
      input,
    };
  },
};
