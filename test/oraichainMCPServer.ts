import { startMcpServer } from "../src/mcp/oraichainIndex";
import { ORAICHAIN_ACTIONS } from "../src/actions";
import { OraichainAgentKit } from "../src/agent";
import "dotenv/config";

(async () => {
  const agent = await OraichainAgentKit.connect(
    process.env.RPC_URL!,
    process.env.MNEMONIC!,
  );

  const finalActions = {
    GET: ORAICHAIN_ACTIONS.GET_NATIVE_BALANCE_ACTION,
  };

  startMcpServer(finalActions, agent, {
    name: "oraichain-agent",
    version: "0.0.1",
  });
})();
