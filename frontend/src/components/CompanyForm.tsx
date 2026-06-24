export type CompanyFormData = {
  name: string;
  one_liner: string;
  culture: string;
  profiles_hired: string;
  tone_preference: string;
  selling_points: string;
};

type Props = {
  form: CompanyFormData;
  loading: boolean;
  hasPersona?: boolean;
  onChange: (form: CompanyFormData) => void;
  onSubmit: () => void;
  onLoadDemo: () => void;
};

const FIELDS: {
  key: keyof CompanyFormData;
  label: string;
  placeholder: string;
  icon: string;
  rows?: number;
}[] = [
  {
    key: "name",
    label: "Company name",
    icon: "◇",
    placeholder: "e.g. PSVIEW, Stripe, Meridian Capital",
  },
  {
    key: "one_liner",
    label: "One-liner",
    icon: "◈",
    placeholder:
      "What the company does in one sentence — e.g. AI agents that source and place candidates in 48 hours",
    rows: 2,
  },
  {
    key: "culture",
    label: "Culture",
    icon: "◎",
    placeholder:
      "Team vibe, values, location — e.g. Small elite team, high agency. US + France. Based at Founders Inc, SF.",
    rows: 2,
  },
  {
    key: "profiles_hired",
    label: "Profiles hired",
    icon: "◆",
    placeholder:
      "Roles & skills you recruit for — e.g. Founding engineers: React/TS, Supabase, LLM orchestration. Client-facing.",
    rows: 2,
  },
  {
    key: "tone_preference",
    label: "Tone preference",
    icon: "♪",
    placeholder: "How the agent should sound — e.g. warm but direct, formal and measured",
  },
  {
    key: "selling_points",
    label: "Selling points",
    icon: "★",
    placeholder:
      "Why a candidate should care — e.g. 6-figure ARR, 20+ paying clients, founding-level scope and equity",
    rows: 2,
  },
];

export default function CompanyForm({
  form,
  loading,
  hasPersona,
  onChange,
  onSubmit,
  onLoadDemo,
}: Props) {
  const filledCount = FIELDS.filter((f) => form[f.key].trim()).length;

  return (
    <section className="glass-card glass-card-glow rounded-2xl p-6 lg:p-8">
      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="section-badge mb-4">
            <span className="section-badge-num">1</span>
            Configure
          </div>
          <h2 className="font-display text-2xl font-bold text-white sm:text-3xl">
            Company context
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-slate-400">
            The agent derives its own personality, voice, and hooks from this —
            nothing is hardcoded.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <div className="h-1.5 flex-1 max-w-[140px] overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${(filledCount / FIELDS.length) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">
              {filledCount}/{FIELDS.length} fields
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onLoadDemo}
          disabled={loading}
          className="btn-secondary shrink-0 border-emerald-800/40 text-emerald-300 hover:border-emerald-600/40"
        >
          Load PSVIEW demo
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {FIELDS.map(({ key, label, placeholder, icon, rows }) => (
          <label
            key={key}
            className={`group block ${rows ? "sm:col-span-2" : ""}`}
          >
            <span className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
              <span className="text-emerald-500/60 transition-colors group-focus-within:text-emerald-400">
                {icon}
              </span>
              {label}
            </span>
            {rows ? (
              <textarea
                rows={rows}
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => onChange({ ...form, [key]: e.target.value })}
                className="input-field resize-none"
              />
            ) : (
              <input
                type="text"
                value={form[key]}
                placeholder={placeholder}
                onChange={(e) => onChange({ ...form, [key]: e.target.value })}
                className="input-field"
              />
            )}
          </label>
        ))}
      </div>

      {!hasPersona ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !form.name.trim()}
          className="btn-primary mt-8"
        >
          {loading ? "Synthesizing persona…" : "Generate agent persona →"}
        </button>
      ) : (
        <p className="mt-8 text-sm text-slate-500">
          Persona ready below. Use{" "}
          <span className="text-emerald-400/90">Regenerate persona</span> to create a
          new agent — name and voice may change.
        </p>
      )}
    </section>
  );
}
