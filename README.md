# PSVIEW Agent — Autonomous Candidate Engagement Demo

**Live:** TBD  
**Repo:** https://github.com/harshitasayala10/psview-agent

## What makes it intelligent, not just an LLM call

Every message is the output of an explicit Observe → Reason → Act → Update loop: the agent turns each reply into structured signals, selects a strategy against its goal and self-authored persona, critiques its own draft, and updates a persistent candidate model before writing. The text is the last step, not the system.

---

> **Status:** Phase 5 — deploying to Vercel. Click **Run demo** on the live site for a one-click walkthrough.

## Quick start (live)

1. Open the live URL
2. Click **Run demo** (header or hero)
3. Watch persona load, opening message generate, and Agent Brain populate
4. Try a skeptical or hostile candidate reply

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

Persona synthesis reuses the latest config per company by default; pass `force: true` to regenerate.

## Deploy frontend (Vercel)

Root directory: `frontend`

Environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
