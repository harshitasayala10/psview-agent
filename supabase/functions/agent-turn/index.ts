import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { callClaudeJSON } from "../_shared/llm.ts";
import {
  CritiqueSchema,
  critiqueToolSchema,
  TurnSchema,
  turnToolSchema,
  type Persona,
} from "../_shared/schemas.ts";

type MessageRow = { role: string; content: string };

type ConversationRow = {
  id: string;
  intent: string;
  state: Record<string, unknown>;
  candidate_name: string | null;
  candidate_profile: string | null;
  agent_configs: {
    persona: Persona;
    companies: {
      name: string;
      one_liner: string | null;
      culture: string | null;
      profiles_hired: string | null;
      selling_points: string | null;
    };
  };
};

function buildTurnSystemPrompt(ctx: ConversationRow): string {
  const persona = ctx.agent_configs.persona;
  const company = ctx.agent_configs.companies;

  return `You are ${persona.agent_name}, an autonomous recruiting agent for ${company.name}.
You act on your own from your persona, the goal, and the conversation so far.
You are NOT a script. Each turn you perceive, decide, then write.

PERSONA: ${JSON.stringify(persona)}
COMPANY: ${company.name} — ${company.one_liner ?? ""}
GOAL (intent): ${ctx.intent}
CANDIDATE: ${ctx.candidate_name ?? "Unknown"} — ${ctx.candidate_profile ?? ""}

Rules:
- The message MUST obey the persona's tone_dials and voice_rules. Consistency is graded.
- The message MUST use company_hooks from the persona where relevant — never generic recruiter copy.
- If the candidate is clearly uninterested or hostile, choosing "disqualify" and ending gracefully is correct.
- If interest is high and questions are answered, move toward "propose_call".
- For opening messages (no candidate reply yet), set observation to null and use strategy "open".`;
}

function buildTurnUserPrompt(
  ctx: ConversationRow,
  history: MessageRow[],
  candidateReply: string | null,
): string {
  const historyText = history.length
    ? history.map((m) => `${m.role}: ${m.content}`).join("\n")
    : "(no messages yet)";

  return `CURRENT STATE: ${JSON.stringify(ctx.state)}
CONVERSATION SO FAR:
${historyText}

LATEST CANDIDATE REPLY: ${candidateReply ?? "NONE — this is your opening message"}

Return your observation (null if opening), plan, draft message, and state_update.`;
}

function buildCritiqueSystemPrompt(ctx: ConversationRow): string {
  const persona = ctx.agent_configs.persona;
  return `You are an editor for ${persona.agent_name}. Critique the draft outreach for:
(1) persona/tone consistency, (2) use of real company hooks vs generic copy,
(3) moving toward the goal without being pushy.

If the draft is already strong, say so and return it unchanged in revised_message.`;
}

function buildCritiqueUserPrompt(
  ctx: ConversationRow,
  draft: string,
  plan: { chosen_strategy: string; rationale: string },
): string {
  return JSON.stringify({
    draft,
    plan,
    goal: ctx.intent,
    persona: ctx.agent_configs.persona,
    company_hooks: ctx.agent_configs.persona.company_hooks,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const body = await req.json();
    const conversation_id = body.conversation_id as string | undefined;
    const candidate_reply = body.candidate_reply as string | undefined;

    if (!conversation_id || typeof conversation_id !== "string") {
      return errorResponse("conversation_id is required", 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .select("*, agent_configs(persona, companies(name, one_liner, culture, profiles_hired, selling_points))")
      .eq("id", conversation_id)
      .single();

    if (convoError || !convo) {
      return errorResponse("Conversation not found", 404);
    }

    const ctx = convo as ConversationRow;

    const { data: historyRows, error: historyError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("conversation_id", conversation_id)
      .order("created_at");

    if (historyError) {
      return errorResponse(historyError.message, 500);
    }

    const history = (historyRows ?? []) as MessageRow[];

    const trimmedReply = candidate_reply?.trim() || null;
    if (trimmedReply) {
      const { error: candError } = await supabase.from("messages").insert({
        conversation_id,
        role: "candidate",
        content: trimmedReply,
      });
      if (candError) {
        return errorResponse(candError.message, 500);
      }
      history.push({ role: "candidate", content: trimmedReply });
    }

    const turn = await callClaudeJSON(
      buildTurnSystemPrompt(ctx),
      buildTurnUserPrompt(ctx, history, trimmedReply),
      TurnSchema,
      turnToolSchema,
    );

    const critique = await callClaudeJSON(
      buildCritiqueSystemPrompt(ctx),
      buildCritiqueUserPrompt(ctx, turn.message, turn.plan),
      CritiqueSchema,
      critiqueToolSchema,
    );

    const reasoning = {
      observation: turn.observation,
      plan: turn.plan,
      draft_message: turn.message,
      critique: critique.critique,
    };

    const { error: msgError } = await supabase.from("messages").insert({
      conversation_id,
      role: "agent",
      content: critique.revised_message,
      reasoning,
    });

    if (msgError) {
      return errorResponse(msgError.message, 500);
    }

    const { error: stateError } = await supabase
      .from("conversations")
      .update({ state: turn.state_update })
      .eq("id", conversation_id);

    if (stateError) {
      return errorResponse(stateError.message, 500);
    }

    return jsonResponse({
      message: critique.revised_message,
      draft_message: turn.message,
      reasoning,
      state: turn.state_update,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
