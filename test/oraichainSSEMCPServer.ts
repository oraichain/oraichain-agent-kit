import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { createMcpServer } from "../src/mcp/oraichainIndex";
import { ORAICHAIN_ACTIONS } from "../src/actions";
import { OraichainAgentKit } from "../src/agent/oraichainAgent";
import { Readable } from "stream";
import { IncomingMessage } from "http";

const app = express();
app.use(express.json());

const transports: Map<string, SSEServerTransport> = new Map();
let server: McpServer;

app.get("/sse", async (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  try {
    if (!server) {
      throw new Error("Server not initialized");
    }

    const connectionId = Date.now().toString();
    const transport = new SSEServerTransport("/messages", res);
    transports.set(connectionId, transport);

    await server.connect(transport);
    // res.write(`data: {"connectionId": "${connectionId}"}\n\n`);
    console.log(`SSE connection established: ${connectionId}`);

    req.on("close", () => {
      transports.delete(connectionId);
      console.log(`Connection ${connectionId} closed`);
    });
  } catch (error) {
    console.error("SSE setup error:", error);
    res.status(500).send(`Error: ${error.message}`);
  }
});

app.post("/messages", async (req, res) => {
  const transport = Array.from(transports.values())[0];
  if (!transport) {
    console.error("No active transport");
    return res.status(503).send("No active SSE transport");
  }

  // Access the parsed body from express.json()
  const body = req.body;
  console.log("POST /messages body:", body);

  // Reconstruct the request stream from the parsed body
  const rawBody = JSON.stringify(body);
  const newReqStream = Readable.from(rawBody);

  // Create a new IncomingMessage-like object
  // handlePostMessage needs a readable stream
  // when we interrupt the request (express.json()) -> make stream not readable
  // so we need to reconstruct it
  const newReq: IncomingMessage = Object.assign(newReqStream, {
    headers: req.headers,
    method: req.method,
    url: req.url,
    // Required IncomingMessage properties with defaults or copied values
    aborted: req.destroyed ?? false,
    httpVersion: req.httpVersion ?? "1.1",
    httpVersionMajor: req.httpVersionMajor ?? 1,
    httpVersionMinor: req.httpVersionMinor ?? 1,
    complete: req.complete ?? true,
    rawHeaders: req.rawHeaders ?? [],
    socket: req.socket, // Pass the original socket (might be needed)
    connection: req.socket, // Alias for socket
    // Add other properties if needed by handlePostMessage
  }) as IncomingMessage;

  try {
    await transport.handlePostMessage(newReq, res);
  } catch (error) {
    console.error("Error in POST /messages:", error);
    res
      .status(400)
      .json({ error: "Failed to process message", details: error.message });
  }
});

app.listen(8080, async () => {
  try {
    const agent = await OraichainAgentKit.connect(process.env.RPC_URL!);

    server = createMcpServer(ORAICHAIN_ACTIONS, agent, {
      name: "oraichain-agent",
      version: "0.0.1",
    });
    console.log("Server listening on port 8080");
  } catch (error) {
    console.error("Server initialization failed:", error);
    process.exit(1);
  }
});
