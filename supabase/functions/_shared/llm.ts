import { z, type ZodSchema } from "npm:zod@3.23.8";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-6";

type ToolSchema = Record<string, unknown>;

export async function callClaudeJSON<T>(
  system: string,
  user: string,
  schema: ZodSchema<T>,
  toolSchema: ToolSchema,
  toolName = "output",
): Promise<T> {
  const apiKey = Deno.env.get("LLM_API_KEY");
  if (!apiKey) {
    throw new Error("LLM_API_KEY secret is not set");
  }

  let lastError = "Unknown validation error";

  for (let attempt = 0; attempt < 2; attempt++) {
    const userMessage =
      attempt === 0
        ? user
        : `${user}\n\nYour previous output failed validation: ${lastError}. Return corrected output using the tool.`;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 2000,
        system,
        tools: [
          {
            name: toolName,
            description: "Return structured JSON output",
            input_schema: toolSchema,
          },
        ],
        tool_choice: { type: "tool", name: toolName },
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Claude API error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    const toolBlock = (data.content ?? []).find(
      (block: { type: string }) => block.type === "tool_use",
    );

    if (!toolBlock?.input) {
      lastError = "No tool_use block in Claude response";
      continue;
    }

    const parsed = schema.safeParse(toolBlock.input);
    if (parsed.success) {
      return parsed.data;
    }

    lastError = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
  }

  throw new Error(`Failed to get valid structured output: ${lastError}`);
}
