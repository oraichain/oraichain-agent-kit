import { PublicKey } from "@solana/web3.js";
import type { Action } from "../types/action";
import type { OraichainAgentKit, SolanaAgentKit } from "../agent";
import { z } from "zod";
import { get_token_balance } from "../tools";
import type { Action as OraichainAction } from "../types/oraichainAction";
import { getBalance } from "../tools/oraichain";
import { add } from "@raydium-io/raydium-sdk-v2";

const tokenBalancesAction: Action = {
  name: "TOKEN_BALANCE_ACTION",
  similes: [
    "check token balances",
    "get wallet token balances",
    "view token balances",
    "show token balances",
    "check token balance",
  ],
  description: `Get the token balances of a Solana wallet.
  If you want to get the balance of your wallet, you don't need to provide the wallet address.`,
  examples: [
    [
      {
        input: {},
        output: {
          status: "success",
          balance: {
            sol: 100,
            tokens: [
              {
                tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                name: "USD Coin",
                symbol: "USDC",
                balance: 100,
                decimals: 9,
              },
            ],
          },
        },
        explanation: "Get token balances of the wallet",
      },
    ],
    [
      {
        input: {
          walletAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        output: {
          status: "success",
          balance: {
            sol: 100,
            tokens: [
              {
                tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
                name: "USD Coin",
                symbol: "USDC",
                balance: 100,
                decimals: 9,
              },
            ],
          },
        },
        explanation: "Get address token balance",
      },
    ],
  ],
  schema: z.object({
    walletAddress: z.string().optional(),
  }),
  handler: async (agent: SolanaAgentKit, input) => {
    const balance = await get_token_balance(
      agent,
      input.tokenAddress && new PublicKey(input.tokenAddress),
    );

    return {
      status: "success",
      balance: balance,
    };
  },
};

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
    walletAddress: z.string().optional(),
  }),
  handler: async (agent: OraichainAgentKit, input) => {
    const balance = await getBalance(agent, input.address, input.denom);

    return {
      status: "success",
      address: input.address,
      balance,
    };
  },
};

export default tokenBalancesAction;
