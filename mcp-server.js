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
import validator from "validator"
import { z } from "zod"

const server = new McpServer({
  name: "Server",
  version: "1.0.0",
})

server.tool(
  //
  "get_ips_by_domain",
  {
    domain: z
      .string({
        description:
          "A fully qualified domain name (e.g. example.com, subdomain.example.com) excluding ip addresses",
        examples: ["example.com", "subdomain.example.com"],
      })
      .refine((string) => validator.isFQDN(string), {
        message: "Must be a valid hostname",
      }),
    // .refine(
    //   (string) => {
    //     try {
    //       new URL("https://root:admin@" + string + ":80/")
    //       return true
    //     } catch {
    //       return false
    //     }
    //   },
    //   { message: "Must be a valid hostname" }
    // )
    // .refine(
    //   (string) => {
    //     try {
    //       z.string().ip().parse(string)
    //       return false
    //     } catch {
    //       return true
    //     }
    //   },
    //   { message: "Must not be an IP address" }
    // ),
  },
  async ({ domain }) => {
    const resp = await fetch("https://ipleak.net/json/" + domain)
    const { error, ips } = await resp.json()
    return error ? { error } : { ips: Object.keys(ips) }
  }
)

server.tool(
  //
  "get_location_by_ip",
  { ip: z.string().ip() },
  async ({ ip }) => {
    const resp = await fetch("https://ipleak.net/json/" + ip)
    return await resp.json()
  }
)

const transport = new StdioServerTransport()
await server.connect(transport)
