import type { OraichainAgentKit } from "../../agent";
import { z } from "zod";
import type { Action as OraichainAction } from "../../types/oraichainAction";

export const oraichainDelegationAction: OraichainAction = {
  name: "QUERY_DELEGATION_ACTION",
  similes: [
    "check delegation of a wallet to a validator",
    "what's the delegated amount of a wallet to a validator",
    "view delegation of a wallet to a validator address",
    "view delegation of a wallet to a operator address",
    "with a validator address and a wallet address, get the delegation",
  ],
  description: `Get the delegation of a wallet to a validator.`,
  examples: [
    [
      {
        input: {
          address: "orai14h0n2nlfrfz8tn9usfyjrxqd23fhj9a0ec0pm7",
          validatorAddress:
            "oraivaloper1f5nyvnx5ks738d5ys7pwa0evc42v6ff0umvnxd",
        },
        output: {
          status: "success",
          data: {
            delegation: {
              delegator_address: "orai14h0n2nlfrfz8tn9usfyjrxqd23fhj9a0ec0pm7",
              validator_address:
                "oraivaloper1f5nyvnx5ks738d5ys7pwa0evc42v6ff0umvnxd",
              shares: "1.000000000000000000",
            },
            balance: {
              denom: "orai",
              amount: "1",
            },
          },
        },
        explanation: "Get delegation of a wallet to a validator",
      },
    ],
  ],
  schema: z.object({
    address: z.string().describe("The wallet address"),
    validatorAddress: z.string().describe("The validator address"),
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
