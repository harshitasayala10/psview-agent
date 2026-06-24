# Phase 0 — Account & secrets checklist

Complete these **before** starting the 24-hour clock. Phase 0 local scaffolding is done in this repo.

## Accounts to create

| Service | URL | What you need |
|---------|-----|---------------|
| **Supabase** | https://supabase.com | New project → note `Project URL`, `anon` key, `service_role` key |
| **Anthropic** | https://console.anthropic.com | API key with billing enabled |
| **Vercel** | https://vercel.com | Connect GitHub (deploy in Phase 5) |
| **GitHub** | https://github.com | Push this repo |

## Local tooling (installed)

- Node.js v22+ ✓
- npm ✓
- Supabase CLI — install if missing: `npm install -g supabase`

## Link Supabase project (after creating project)

```bash
cd /Users/harshitasayala/PsView
supabase login
supabase link --project-ref <your-project-ref>
```

Your project ref is the subdomain in `https://<ref>.supabase.co`.

## Environment files

### Frontend (`frontend/.env.local`) — gitignored

```bash
cp frontend/.env.example frontend/.env.local
# Edit with your Supabase URL and anon key
```

### Edge Function secrets (Phase 2+)

```bash
supabase secrets set LLM_API_KEY=sk-ant-...
```

Then test persona synthesis:

```bash
export VITE_SUPABASE_ANON_KEY="your-anon-key"
./scripts/test-synthesize-persona.sh
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are auto-injected in Edge Functions on hosted Supabase.

## Secrets — never commit

- `LLM_API_KEY` (Anthropic)
- `SUPABASE_SERVICE_ROLE_KEY`
- Any `.env.local` file

## Verify Phase 0 complete

- [ ] Git repo initialized
- [ ] `frontend/` scaffold (React + TypeScript + Tailwind)
- [ ] `supabase/` config present
- [ ] `.gitignore` excludes secrets
- [ ] Supabase project created (you)
- [ ] Anthropic API key ready (you)
- [x] `frontend/.env.local` filled in (you)
- [x] Supabase linked (`ounihqegansfgubbsluy`)
- [x] Migrations pushed (`supabase db push`)
- [ ] `cd frontend && npm install && npm run dev` works

## Next: Phase 1

Run database migration, seed test companies, finalize README one-liner.
