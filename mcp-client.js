import { MCPClient } from "mcp-client"
import boxen from "./boxen.js"

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

const tools = await client.getAllTools()

console.log(boxen([tools], { title: "tools" }))

const result = await client.callTool({
  name: "get_location_by_ip",
  arguments: { ip: "223.123.43.3" },
})

console.log(boxen([result], { title: "result" }))
