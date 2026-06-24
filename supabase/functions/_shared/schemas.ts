import { z } from "npm:zod@3.23.8";

export const PersonaSchema = z.object({
  agent_name: z.string().min(1),
  archetype: z.string().min(1),
  tone_dials: z.object({
    formality: z.number().min(0).max(10),
    warmth: z.number().min(0).max(10),
    directness: z.number().min(0).max(10),
    humor: z.number().min(0).max(10),
    enthusiasm: z.number().min(0).max(10),
  }),
  voice_rules: z.array(z.string()).min(3).max(5),
  company_hooks: z.array(z.string()).min(2),
  target_profile_understanding: z.string().min(1),
  goal_framing: z.string().min(1),
  guardrails: z.array(z.string()).min(2),
});

export type Persona = z.infer<typeof PersonaSchema>;

export const personaToolSchema = {
  type: "object" as const,
  properties: {
    agent_name: { type: "string", description: "Human first name fitting the brand" },
    archetype: { type: "string", description: "e.g. warm insider, sharp operator" },
    tone_dials: {
      type: "object",
      properties: {
        formality: { type: "number", minimum: 0, maximum: 10 },
        warmth: { type: "number", minimum: 0, maximum: 10 },
        directness: { type: "number", minimum: 0, maximum: 10 },
        humor: { type: "number", minimum: 0, maximum: 10 },
        enthusiasm: { type: "number", minimum: 0, maximum: 10 },
      },
      required: ["formality", "warmth", "directness", "humor", "enthusiasm"],
      additionalProperties: false,
    },
    voice_rules: {
      type: "array",
      items: { type: "string" },
      minItems: 3,
      maxItems: 5,
    },
    company_hooks: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
    },
    target_profile_understanding: { type: "string" },
    goal_framing: { type: "string" },
    guardrails: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
    },
  },
  required: [
    "agent_name",
    "archetype",
    "tone_dials",
    "voice_rules",
    "company_hooks",
    "target_profile_understanding",
    "goal_framing",
    "guardrails",
  ],
  additionalProperties: false,
};

const strategyEnum = z.enum([
  "open",
  "build_rapport",
  "pitch_value",
  "handle_objection",
  "answer_question",
  "propose_call",
  "nudge",
  "disqualify",
]);

export const TurnSchema = z.object({
  observation: z
    .object({
      sentiment: z.enum(["positive", "neutral", "negative", "hostile"]),
      interest_signal: z.number().min(-20).max(20),
      objections: z.array(z.string()),
      questions: z.array(z.string()),
      stage_signal: z.string(),
    })
    .nullable(),
  plan: z.object({
    chosen_strategy: strategyEnum,
    rationale: z.string().min(1),
  }),
  message: z.string().min(1),
  state_update: z.object({
    stage: z.string().min(1),
    interest_score: z.number().min(0).max(100),
    objections: z.array(z.string()),
    candidate_model: z.record(z.unknown()),
  }),
});

export type TurnResult = z.infer<typeof TurnSchema>;

export const CritiqueSchema = z.object({
  critique: z.string().min(1),
  revised_message: z.string().min(1),
});

export type CritiqueResult = z.infer<typeof CritiqueSchema>;

export const turnToolSchema = {
  type: "object" as const,
  properties: {
    observation: {
      type: ["object", "null"],
      properties: {
        sentiment: {
          type: "string",
          enum: ["positive", "neutral", "negative", "hostile"],
        },
        interest_signal: { type: "number", minimum: -20, maximum: 20 },
        objections: { type: "array", items: { type: "string" } },
        questions: { type: "array", items: { type: "string" } },
        stage_signal: { type: "string" },
      },
      required: [
        "sentiment",
        "interest_signal",
        "objections",
        "questions",
        "stage_signal",
      ],
      additionalProperties: false,
    },
    plan: {
      type: "object",
      properties: {
        chosen_strategy: {
          type: "string",
          enum: [
            "open",
            "build_rapport",
            "pitch_value",
            "handle_objection",
            "answer_question",
            "propose_call",
            "nudge",
            "disqualify",
          ],
        },
        rationale: { type: "string" },
      },
      required: ["chosen_strategy", "rationale"],
      additionalProperties: false,
    },
    message: { type: "string" },
    state_update: {
      type: "object",
      properties: {
        stage: { type: "string" },
        interest_score: { type: "number", minimum: 0, maximum: 100 },
        objections: { type: "array", items: { type: "string" } },
        candidate_model: { type: "object", additionalProperties: true },
      },
      required: ["stage", "interest_score", "objections", "candidate_model"],
      additionalProperties: false,
    },
  },
  required: ["observation", "plan", "message", "state_update"],
  additionalProperties: false,
};

export const critiqueToolSchema = {
  type: "object" as const,
  properties: {
    critique: { type: "string" },
    revised_message: { type: "string" },
  },
  required: ["critique", "revised_message"],
  additionalProperties: false,
};
