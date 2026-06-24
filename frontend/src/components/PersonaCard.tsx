import type { Persona } from "../lib/supabase";
import { DEFAULT_INTENT } from "../lib/constants";

type Props = {
  persona: Persona;
  reused?: boolean;
  candidateName: string;
  candidateProfile: string;
  intent: string;
  loading: boolean;
  onCandidateNameChange: (v: string) => void;
  onCandidateProfileChange: (v: string) => void;
  onIntentChange: (v: string) => void;
  onStartConversation: () => void;
  onRegenerate: () => void;
};

const DIAL_LABELS: { key: keyof Persona["tone_dials"]; label: string; color: string }[] = [
  { key: "formality", label: "Formality", color: "from-blue-400 to-indigo-500" },
  { key: "warmth", label: "Warmth", color: "from-rose-400 to-orange-500" },
  { key: "directness", label: "Directness", color: "from-emerald-400 to-teal-500" },
  { key: "humor", label: "Humor", color: "from-amber-400 to-yellow-500" },
  { key: "enthusiasm", label: "Enthusiasm", color: "from-violet-400 to-purple-500" },
];

export default function PersonaCard({
  persona,
  reused,
  candidateName,
  candidateProfile,
  intent,
  loading,
  onCandidateNameChange,
  onCandidateProfileChange,
  onIntentChange,
  onStartConversation,
  onRegenerate,
}: Props) {
  return (
    <section className="glass-card glass-card-glow overflow-hidden rounded-2xl">
      <div className="relative border-b border-white/[0.06] bg-gradient-to-br from-emerald-950/50 via-transparent to-indigo-950/30 px-6 py-8 lg:px-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="section-badge mb-5">
          <span className="section-badge-num">2</span>
          Persona
        </div>
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-5">
            <div className="avatar-glow flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 font-display text-2xl font-bold text-white shadow-xl shadow-emerald-900/40">
              {persona.agent_name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-widest text-slate-500">
                Self-generated agent
              </p>
              <h2 className="font-display text-3xl font-bold text-white sm:text-4xl">
                {persona.agent_name}
              </h2>
              <p className="mt-1 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-0.5 text-sm text-emerald-300">
                {persona.archetype}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Name chosen by the model from company context — not hardcoded.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRegenerate}
            disabled={loading}
            className="btn-secondary shrink-0 border-amber-800/30 text-amber-200/90 text-xs"
            title="Run synthesis again — agent name and voice may change"
          >
            Regenerate persona
          </button>
        </div>
        {reused && (
          <p className="relative mt-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-300/90">
            Loaded existing persona for this company — same agent on repeat demo runs.
          </p>
        )}
      </div>

      <div className="p-6 lg:p-8">
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {DIAL_LABELS.map(({ key, label, color }, i) => (
            <div
              key={key}
              className="rounded-xl border border-white/[0.06] bg-black/25 p-4 transition-colors hover:border-emerald-500/20 hover:bg-black/35"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="mb-3 flex justify-between text-xs">
                <span className="font-medium text-slate-400">{label}</span>
                <span className="font-display font-bold text-white">
                  {persona.tone_dials[key]}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-800/80">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${color} shadow-[0_0_12px_rgba(16,185,129,0.3)] transition-all duration-1000 ease-out`}
                  style={{ width: `${persona.tone_dials[key] * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mb-8 grid gap-4 lg:grid-cols-2">
          <InfoBlock title="Voice rules" items={persona.voice_rules} />
          <InfoBlock title="Company hooks" items={persona.company_hooks} accent />
          <InfoBlock title="Guardrails" items={persona.guardrails} />
          <div className="rounded-xl border border-white/[0.06] bg-gradient-to-br from-black/30 to-emerald-950/20 p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-400/80">
              Target profile
            </p>
            <p className="text-sm leading-relaxed text-slate-300">
              {persona.target_profile_understanding}
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-xl border border-dashed border-emerald-500/20 bg-gradient-to-br from-black/30 to-emerald-950/15 p-6">
          <div className="pointer-events-none absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-emerald-500/5 blur-2xl" />
          <h3 className="font-display text-xl font-bold text-white">
            Start test conversation
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Simulate a candidate — nothing is sent for real.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Candidate name
              </span>
              <input
                value={candidateName}
                onChange={(e) => onCandidateNameChange(e.target.value)}
                placeholder="e.g. Alex Chen"
                className="input-field"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Intent
              </span>
              <input
                value={intent}
                onChange={(e) => onIntentChange(e.target.value)}
                placeholder={DEFAULT_INTENT}
                className="input-field"
              />
            </label>
            <label className="block text-sm sm:col-span-2">
              <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
                Candidate profile
              </span>
              <textarea
                rows={2}
                value={candidateProfile}
                onChange={(e) => onCandidateProfileChange(e.target.value)}
                placeholder="Senior engineer, years of experience, stack, company stage, disposition — e.g. Passive but curious about founding roles"
                className="input-field resize-none"
              />
            </label>
          </div>
          <button
            type="button"
            onClick={onStartConversation}
            disabled={loading || !candidateName.trim()}
            className="btn-primary relative mt-5"
          >
            {loading ? "Creating…" : "Create conversation →"}
          </button>
        </div>
      </div>
    </section>
  );
}

function InfoBlock({
  title,
  items,
  accent,
}: {
  title: string;
  items: string[];
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/25 p-5 transition-colors hover:border-white/10">
      <p
        className={`mb-3 text-xs font-semibold uppercase tracking-wider ${
          accent ? "text-emerald-400" : "text-slate-500"
        }`}
      >
        {title}
      </p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li
            key={i}
            className="flex gap-3 text-sm leading-relaxed text-slate-400"
          >
            <span
              className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                accent ? "bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" : "bg-slate-600"
              }`}
            />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
