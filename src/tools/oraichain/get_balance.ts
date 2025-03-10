import { OraichainAgentKit } from "../../agent/oraichainAgent";
import { Coin } from "@cosmjs/stargate";

/**
 * Get the balance of a native token for a given account
 * @param agent - OraichainAgentKit instance
 * @param denom - Denomination of the token
 * @param accountIndex - Index of the account to get the balance for
 * @returns Coin object representing the balance
 */
export async function getBalance(
  agent: OraichainAgentKit,
  denom: string,
  address: string,
): Promise<Coin> {
  return await agent.client.getBalance(address, denom);
}
