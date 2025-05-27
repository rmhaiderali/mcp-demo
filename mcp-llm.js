import dotenv from "dotenv"
import { createOpenRouter } from "@openrouter/ai-sdk-provider"
import { jsonSchemaToZod } from "json-schema-to-zod"
import { generateText } from "ai"
import z from "zod"
import client from "./mcp-client.js"
import boxen from "./utils/boxen.js"
import functionCallLitral from "./utils/functionCallLitral.js"

dotenv.config()

console.log(process.env.OPENROUTER_API_KEY)
const openrouter = createOpenRouter({ apiKey: process.env.OPENROUTER_API_KEY })

const mcpTools = await client.getAllTools()
console.log(
  boxen([mcpTools], { borderColor: "magenta", title: "Available tools" })
)
const availableTools = Object.fromEntries(
  mcpTools.map((tool) => [
    tool.name,
    {
      name: tool.name,
      description: tool.description,
      parameters: eval(jsonSchemaToZod(tool.inputSchema)),
    },
  ])
)

const messages = []

export default async function (prompt) {
  messages.push({ role: "user", content: prompt })

  while (true) {
    const result = await generateText({
      model: openrouter.chat("openai/gpt-4o"),
      messages: messages,
      tools: availableTools,
    })

    result.response.messages.forEach((message) => messages.push(message))

    if (result.finishReason === "tool-calls") {
      for (const toolCall of result.toolCalls) {
        console.log(
          boxen([toolCall], {
            borderColor: "yellow",
            title: "LLM requested tool call",
          })
        )

        let toolOutput
        try {
          toolOutput = await client.callTool({
            name: toolCall.toolName,
            arguments: toolCall.args,
          })
          console.log(
            boxen([toolOutput], {
              borderColor: "green",
              title:
                "Output from tool " +
                functionCallLitral(toolCall.toolName, toolCall.args),
            })
          )
        } catch (error) {
          toolOutput = { error: error.message }
          console.log(
            boxen([error.message], {
              borderColor: "red",
              title:
                "Error calling tool " +
                functionCallLitral(toolCall.toolName, toolCall.args),
            })
          )
        }

        messages.push({
          role: "tool",
          content: [
            {
              type: "tool-result",
              toolCallId: toolCall.toolCallId,
              toolName: toolCall.toolName,
              result: toolOutput,
            },
            // there could be more tool results here (parallel calling)
          ],
        })
      }
    }
    //
    else if (result.finishReason === "stop") {
      console.log(
        boxen([result.text], { borderColor: "green", title: "LLM response" })
      )
      // break
      return result.text
    }
    //
    else {
      // No text and no tool calls, something unexpected.
      console.log(
        boxen(["LLM did not provided a text response or tool call"], {
          borderColor: "red",
        })
      )
      // break
      return "LLM did not provided a text response or tool call"
    }
  }
}
