import { supabase } from "./supabase";
import type { Persona, ConversationState } from "./supabase";

const functionsUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function callFunction<T>(name: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(`${functionsUrl}/${name}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${anonKey}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback =
      res.status >= 500
        ? "Server error — the agent may have timed out. Try again."
        : `Function ${name} failed (${res.status})`;
    throw new Error((data as { error?: string }).error ?? fallback);
  }
  return data as T;
}

export type SynthesizePersonaResult = {
  agent_config_id: string;
  persona: Persona;
  reused?: boolean;
};

export type AgentTurnResult = {
  message: string;
  draft_message: string;
  reasoning: {
    observation: Record<string, unknown> | null;
    plan: { chosen_strategy: string; rationale: string };
    draft_message?: string;
    critique?: string;
  };
  state: ConversationState;
};

export async function synthesizePersona(
  companyId: string,
  options?: { force?: boolean },
): Promise<SynthesizePersonaResult> {
  return callFunction("synthesize-persona", {
    company_id: companyId,
    ...(options?.force ? { force: true } : {}),
  });
}

export async function runAgentTurn(
  conversationId: string,
  candidateReply?: string,
): Promise<AgentTurnResult> {
  const body: Record<string, unknown> = { conversation_id: conversationId };
  if (candidateReply?.trim()) {
    body.candidate_reply = candidateReply.trim();
  }
  return callFunction("agent-turn", body);
}

export { supabase };
