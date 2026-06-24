# PSVIEW Agent — Build Status

**Live:** TBD (deploy in progress)  
**Repo:** TBD

Quick status tracker. Full step-by-step plan: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

## Phase progress

| Phase | Status | Notes |
|-------|--------|-------|
| 0 — Accounts & tooling | Done | Supabase linked, CLI, env |
| 1 — Database schema | Done | 4 tables, seed companies |
| 2 — `synthesize-persona` | Done | Deployed, curl-tested PSVIEW + Meridian |
| 3 — `agent-turn` | Done | Opening, positive, skeptical, hostile all pass |
| 4 — React UI | Done | Form, persona card, thread, Agent Brain panel |
| 5 — Deploy | In progress | Vercel + one-click Run demo |
| 6 — Polish | Pending | Brain panel UX, interest gauge |
| 7 — README + submit | Pending | Pre-flight checklist |
| 8 — Buffer | Pending | Final smoke test |

## Key IDs (production)

- Project: `ounihqegansfgubbsluy`
- PSVIEW company: `dad84ee0-f465-49ce-a89e-4af554134104`
- Meridian company: `47e9e500-4adc-44b1-9177-0e8855632cda`
- PSVIEW agent_config (Léa): `933a1b17-55f8-4ebb-9af1-fe841c010d00`

## Test scripts

```bash
./scripts/test-synthesize-persona.sh
./scripts/test-agent-turn.sh
```

## One-click demo (live)

Click **Run demo** in the header — loads PSVIEW context, reuses persona, creates conversation, and generates opening message with Brain panel visible.
