import { MCPClient } from "mcp-client"

const client = new MCPClient({
  name: "Client",
  version: "1.0.0",
})

await client.connect({
  type: "stdio",
  command: "node",
  args: ["mcp-server.js"],
  env: {},
})

export default client
