import { createClient } from "jsr:@supabase/supabase-js@2";
import { corsHeaders, errorResponse, jsonResponse } from "../_shared/cors.ts";
import { callClaudeJSON } from "../_shared/llm.ts";
import { PersonaSchema, personaToolSchema } from "../_shared/schemas.ts";

const PERSONA_SYSTEM_PROMPT = `You are a persona architect for an autonomous recruiting agent. Given a company's context, DERIVE a complete, consistent agent persona this company would deploy to engage candidates. Do not write any outreach yet — only design the agent.

Rules:
- Ground every field in the provided context. Generic personas are a failure.
- The tone dials must reflect the stated tone (e.g. "warm but direct" => warmth high, directness high, formality mid).
- Make it specific enough that two different companies produce visibly different agents.
- company_hooks must be pulled from real selling points in the context, not invented generic perks.
- voice_rules must be concrete do/don't rules for how the agent writes messages.`;

function buildCompanyUserMessage(company: Record<string, unknown>): string {
  return `Design the recruiting agent persona for this company:

Name: ${company.name ?? ""}
One-liner: ${company.one_liner ?? ""}
Culture: ${company.culture ?? ""}
Profiles hired: ${company.profiles_hired ?? ""}
Tone preference: ${company.tone_preference ?? ""}
Selling points: ${company.selling_points ?? ""}`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return errorResponse("Method not allowed", 405);
  }

  try {
    const { company_id } = await req.json();

    if (!company_id || typeof company_id !== "string") {
      return errorResponse("company_id is required", 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("*")
      .eq("id", company_id)
      .single();

    if (companyError || !company) {
      return errorResponse("Company not found", 404);
    }

    const persona = await callClaudeJSON(
      PERSONA_SYSTEM_PROMPT,
      buildCompanyUserMessage(company),
      PersonaSchema,
      personaToolSchema,
    );

    const { data: agentConfig, error: insertError } = await supabase
      .from("agent_configs")
      .insert({ company_id, persona })
      .select("id, persona, created_at")
      .single();

    if (insertError || !agentConfig) {
      return errorResponse(insertError?.message ?? "Failed to save persona", 500);
    }

    return jsonResponse({
      agent_config_id: agentConfig.id,
      persona: agentConfig.persona,
      created_at: agentConfig.created_at,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
