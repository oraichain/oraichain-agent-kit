import { PublicKey } from "@solana/web3.js";
import { Tool } from "langchain/tools";
import { OraichainAgentKit } from "../../agent";

export class OraichainBalanceTool extends Tool {
  name = "oraichain_balance";
  description = `Get the balance of a Oraichain wallet.

  If you want to get the balance of your first wallet, you don't need to provide the accountIndex.

  Inputs ( input is a JSON string ):
  denom: string, eg: "orai",
  accountIndex: number, eg: 0 (optional)
  `;

  constructor(private solanaKit: OraichainAgentKit) {
    super();
  }

  protected async _call(input: string): Promise<string> {
    try {
      const { denom, address } = JSON.parse(input);
      const coin = await this.solanaKit.getBalance(address, denom);

      return JSON.stringify({
        status: "success",
        address,
        balance: coin,
      });
    } catch (error: any) {
      return JSON.stringify({
        status: "error",
        message: error.message,
        code: error.code || "UNKNOWN_ERROR",
      });
    }
  }
}
