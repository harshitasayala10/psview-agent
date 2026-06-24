import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in frontend/.env.local",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Company = {
  id: string;
  name: string;
  one_liner: string | null;
  culture: string | null;
  profiles_hired: string | null;
  tone_preference: string | null;
  selling_points: string | null;
  raw_context: Record<string, unknown> | null;
  created_at: string;
};

export type Persona = {
  agent_name: string;
  archetype: string;
  tone_dials: {
    formality: number;
    warmth: number;
    directness: number;
    humor: number;
    enthusiasm: number;
  };
  voice_rules: string[];
  company_hooks: string[];
  target_profile_understanding: string;
  goal_framing: string;
  guardrails: string[];
};

export type AgentConfig = {
  id: string;
  company_id: string;
  persona: Persona;
  created_at: string;
};

export type ConversationState = {
  stage: string;
  interest_score: number;
  objections: string[];
  candidate_model: Record<string, unknown>;
};

export type Conversation = {
  id: string;
  agent_config_id: string;
  candidate_name: string | null;
  candidate_profile: string | null;
  intent: string;
  state: ConversationState;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  role: "agent" | "candidate";
  content: string;
  reasoning: {
    observation?: Record<string, unknown> | null;
    plan?: { chosen_strategy: string; rationale: string };
    draft_message?: string;
    critique?: string;
  } | null;
  created_at: string;
};
