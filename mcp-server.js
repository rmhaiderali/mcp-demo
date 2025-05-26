// {
//   "mcpServers": {
//     "get-location-by-ip": {
//       "command": "node",
//       "args": ["mcp-server.js"]
//     }
//   }
// }

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { z } from "zod"

const server = new McpServer({
  name: "Server",
  version: "1.0.0",
})

server.tool(
  "get_location_by_ip",
  { ip: z.string().ip({ version: "v4" }) },
  async ({ ip }) => {
    const resp = await fetch("https://ipleak.net/json/" + ip)
    const { region_name, country_name } = await resp.json()
    return {
      content: [{ type: "text", text: region_name + ", " + country_name }],
    }
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
