-- Seed test companies for curl/UI testing (Phase 2+)
insert into companies (name, one_liner, culture, profiles_hired, tone_preference, selling_points, raw_context)
values
  (
    'PSVIEW',
    'AI agents that source, engage, and place candidates end-to-end',
    'Small elite team, high agency, founders who ship. US + France. Founders Inc SF.',
    'Founding engineers: full-stack TS/React, Supabase, LLM orchestration. High agency, client-facing.',
    'warm but direct',
    '6-figure ARR, 20+ paying clients, real revenue. Work directly impacts hiring across US and France.',
    '{"name":"PSVIEW","one_liner":"AI agents that source, engage, and place candidates end-to-end","culture":"Small elite team, high agency, founders who ship. US + France. Founders Inc SF.","profiles_hired":"Founding engineers: full-stack TS/React, Supabase, LLM orchestration. High agency, client-facing.","tone_preference":"warm but direct","selling_points":"6-figure ARR, 20+ paying clients, real revenue. Work directly impacts hiring across US and France."}'::jsonb
  ),
  (
    'Meridian Capital',
    'Global investment bank, 150 years of market leadership',
    'Formal, precise, meritocratic. Deep expertise valued over hustle culture.',
    'VP-level quantitative researchers with PhD in math/physics, 8+ years sell-side experience.',
    'formal and measured',
    'Top-tier compensation, global mobility, access to flagship trading desk.',
    '{"name":"Meridian Capital","one_liner":"Global investment bank, 150 years of market leadership","culture":"Formal, precise, meritocratic. Deep expertise valued over hustle culture.","profiles_hired":"VP-level quantitative researchers with PhD in math/physics, 8+ years sell-side experience.","tone_preference":"formal and measured","selling_points":"Top-tier compensation, global mobility, access to flagship trading desk."}'::jsonb
  );
