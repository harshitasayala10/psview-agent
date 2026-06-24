# PSVIEW Agent — Autonomous Candidate Engagement Demo

**Live:** TBD  
**Repo:** TBD

## What makes it intelligent, not just an LLM call

Every message is the output of an explicit Observe → Reason → Act → Update loop: the agent turns each reply into structured signals, selects a strategy against its goal and self-authored persona, critiques its own draft, and updates a persistent candidate model before writing. The text is the last step, not the system.

---

> **Status:** Phase 3 complete — `agent-turn` deployed and tested (opening, positive, skeptical, hostile). Next: Phase 4 (React UI). See [BUILD_PLAN.md](BUILD_PLAN.md) and [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md).

## Stack

- **Frontend:** React + TypeScript + Tailwind (Vite) → Vercel
- **Backend:** Supabase Postgres + Edge Functions (Deno)
- **LLM:** Claude Sonnet 4.6 (server-side only)

## Local development

```bash
cd frontend && npm install && npm run dev
```

Ensure `frontend/.env.local` has `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

## Database

```bash
supabase db push
```

Tables: `companies`, `agent_configs`, `conversations`, `messages`

## Edge Functions

```bash
supabase functions deploy synthesize-persona
supabase functions deploy agent-turn
supabase secrets set LLM_API_KEY=sk-ant-...
```

## Build plan

- [BUILD_PLAN.md](BUILD_PLAN.md) — phase progress tracker
- [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) — full 24h implementation plan (phases 0–8)
