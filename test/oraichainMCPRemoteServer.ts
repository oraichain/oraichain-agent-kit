import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMcpServer } from "../src/mcp/oraichainIndex";
import { ORAICHAIN_ACTIONS } from "../src/actions";
import { OraichainAgentKit } from "../src/agent/oraichainAgent";

let transport: SSEServerTransport;
let server: McpServer;

// ... set up server resources, tools, and prompts ...

const app = express();

app.use(express.json());

app.get("/sse", async (req, res) => {
  const agent = await OraichainAgentKit.connect(
    process.env.RPC_URL!,
    process.env.MNEMONIC!,
  );

  const finalActions = {
    GET: ORAICHAIN_ACTIONS.GET_NATIVE_BALANCE_ACTION,
  };

  if (!server) {
    server = createMcpServer(finalActions, agent, {
      name: "oraichain-agent",
      version: "0.0.1",
    });
    transport = new SSEServerTransport("/messages", res);
    await server.connect(transport);
  }
});

app.post("/messages", async (req, res) => {
  // Note: to support multiple simultaneous connections, these messages will
  // need to be routed to a specific matching transport. (This logic isn't
  // implemented here, for simplicity.)
  if (!transport) {
    res.status(500).send("No transport");
    return;
  }
  console.log("Before handlePostMessage: ", req.body);
  try {
    await transport.handlePostMessage(req, res);
  } catch (error) {
    console.log("error: ", error);
    return res.status(400).send("Error: " + JSON.stringify(error));
  }
});

app.listen(8080, () => {
  console.log("Server listening on port 8080");
});
