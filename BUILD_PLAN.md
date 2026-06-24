# PSVIEW Agent — Build Status

**Live:** TBD | **Repo:** TBD

Quick status tracker. Full step-by-step plan: [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md)

## Phase progress

| Phase | Status | Notes |
|-------|--------|-------|
| 0 — Accounts & tooling | Done | Supabase linked, CLI, env |
| 1 — Database schema | Done | 4 tables, seed companies |
| 2 — `synthesize-persona` | Done | Deployed, curl-tested PSVIEW + Meridian |
| 3 — `agent-turn` | Done | Opening, positive, skeptical, hostile all pass |
| 4 — React UI | Pending | Form, persona, thread, Brain panel |
| 5 — Deploy | Pending | Vercel + demo seed |
| 6 — Polish | Pending | Brain panel UX, interest gauge |
| 7 — README + submit | Pending | Pre-flight checklist |
| 8 — Buffer | Pending | Final smoke test |

## Key IDs (production)

- Project: `ounihqegansfgubbsluy`
- PSVIEW company: `dad84ee0-f465-49ce-a89e-4af554134104`
- Meridian company: `47e9e500-4adc-44b1-9177-0e8855632cda`
- PSVIEW agent_config (Léa): `8542d691-f75d-46d1-976a-e13b6d6e7642`

## Test scripts

```bash
./scripts/test-synthesize-persona.sh
./scripts/test-agent-turn.sh
```
