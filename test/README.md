# Test Oraichain MCP client & server

## Update .env file

```bash
MISTRAL_API_KEY=
RPC_URL=
MNEMONIC=
```

In the root directory, run:

## Run the MCP server

```bash
tsx test/oraichainMCPServer.ts
```

## Run the MCP client

```bash
tsx test/oraichainMCPClient.ts test/oraichainMCPServer.ts
```

- When asking for prompt in MCP client, enter the following as an example:

```bash
query balance of wallet orai14h0n2nlfrfz8tn9usfyjrxqd23fhj9a0ec0pm7 with denom orai
```

# Test Oraichain SSE MCP client & server

## Update .env file

```bash
MISTRAL_API_KEY=
RPC_URL=
MNEMONIC=
```

In the root directory, run:

## Run the MCP server

```bash
tsx test/oraichainMCPRemoteServer.ts
```

## Run the MCP client

```bash
node test/oraichainSSEMCPClient.mjs
```

# Run MCP Server Inspector for debugging

1. Start the MCP server

2. Start the inspector using the following command:

```bash
# you can choose a different server
SERVER_PORT=9000 npx @modelcontextprotocol/inspector
```