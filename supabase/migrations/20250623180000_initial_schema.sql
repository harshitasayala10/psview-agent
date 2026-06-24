-- COMPANIES: raw context from the form
create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  one_liner text,
  culture text,
  profiles_hired text,
  tone_preference text,
  selling_points text,
  raw_context jsonb,
  created_at timestamptz default now()
);

-- AGENT_CONFIGS: persona the agent writes for itself
create table if not exists agent_configs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  persona jsonb not null,
  created_at timestamptz default now()
);

-- CONVERSATIONS: one outreach thread with one simulated candidate
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  agent_config_id uuid references agent_configs(id) on delete cascade,
  candidate_name text,
  candidate_profile text,
  intent text not null,
  state jsonb not null default '{"stage":"opening","interest_score":50,"objections":[],"candidate_model":{}}',
  created_at timestamptz default now()
);

-- MESSAGES: every turn, with reasoning trace on agent turns
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  role text not null check (role in ('agent', 'candidate')),
  content text not null,
  reasoning jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_agent_configs_company_id on agent_configs(company_id);
create index if not exists idx_conversations_agent_config_id on conversations(agent_config_id);
create index if not exists idx_messages_conversation_id on messages(conversation_id);
