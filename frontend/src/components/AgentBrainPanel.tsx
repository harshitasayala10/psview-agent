import { useState, type ReactNode } from "react";
import type { AgentTurnResult } from "../lib/api";
import type { ConversationState } from "../lib/supabase";

type Props = {
  reasoning: AgentTurnResult["reasoning"] | null;
  state: ConversationState | null;
  draftMessage: string | null;
  finalMessage: string | null;
  loading: boolean;
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  neutral: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  negative: "bg-orange-500/15 text-orange-300 border-orange-500/30",
  hostile: "bg-red-500/15 text-red-300 border-red-500/30",
};

const STRATEGY_COLORS: Record<string, string> = {
  open: "bg-blue-500/15 text-blue-300 border-blue-500/25",
  build_rapport: "bg-teal-500/15 text-teal-300 border-teal-500/25",
  pitch_value: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  handle_objection: "bg-amber-500/15 text-amber-300 border-amber-500/25",
  answer_question: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25",
  propose_call: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  nudge: "bg-slate-600/30 text-slate-200 border-slate-500/25",
  disqualify: "bg-red-500/20 text-red-200 border-red-500/30",
};

const LOOP_STEPS = ["Observe", "Reason", "Critique", "Update"];

export default function AgentBrainPanel({
  reasoning,
  state,
  draftMessage,
  finalMessage,
  loading,
}: Props) {
  const [showDraft, setShowDraft] = useState(false);

  const observation = reasoning?.observation as {
    sentiment?: string;
    interest_signal?: number;
    objections?: string[];
    questions?: string[];
    stage_signal?: string;
  } | null | undefined;

  const plan = reasoning?.plan;
  const critique = reasoning?.critique;
  const strategy = plan?.chosen_strategy;

  const interest = state?.interest_score ?? 0;
  const interestGradient =
    interest >= 61
      ? "from-emerald-400 to-teal-300"
      : interest >= 31
        ? "from-amber-400 to-orange-400"
        : "from-red-400 to-rose-400";

  return (
    <section className="font-mono-brain flex h-full flex-col overflow-hidden rounded-2xl border border-emerald-500/15 bg-[#050810] shadow-[0_0_60px_rgba(16,185,129,0.08)]">
      <div className="border-b border-emerald-500/10 bg-gradient-to-r from-emerald-950/60 via-transparent to-violet-950/20 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-40" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </span>
            <h2 className="font-display text-sm font-bold text-emerald-300">Agent Brain</h2>
          </div>
          {loading && (
            <span className="text-[10px] uppercase tracking-widest text-emerald-500/60 animate-pulse-soft">
              Processing
            </span>
          )}
        </div>

        <div className="mt-3 flex items-center gap-1">
          {LOOP_STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <span
                className={`rounded px-2 py-0.5 text-[9px] font-medium uppercase tracking-wider transition-all ${
                  loading
                    ? "bg-emerald-500/20 text-emerald-300"
                    : reasoning
                      ? "bg-emerald-500/10 text-emerald-500/70"
                      : "bg-slate-800/50 text-slate-600"
                }`}
                style={loading ? { animationDelay: `${i * 0.2}s` } : undefined}
              >
                {s}
              </span>
              {i < LOOP_STEPS.length - 1 && (
                <span className="mx-0.5 text-[10px] text-slate-700">→</span>
              )}
            </div>
          ))}
        </div>
      </div>

      <div
        className="scroll-area flex-1 space-y-3 overflow-y-auto p-5"
        style={{ minHeight: 400 }}
      >
        {!loading && !reasoning && (
          <div className="flex h-full min-h-[280px] flex-col items-center justify-center rounded-xl border border-dashed border-emerald-500/15 bg-emerald-950/10 p-8 text-center">
            <div className="mb-4 grid grid-cols-2 gap-2">
              {LOOP_STEPS.map((s) => (
                <div
                  key={s}
                  className="rounded-lg border border-white/5 bg-black/30 px-3 py-2 text-[10px] uppercase tracking-wider text-slate-600"
                >
                  {s}
                </div>
              ))}
            </div>
            <p className="text-xs leading-relaxed text-slate-500">
              Internal reasoning appears here after each agent turn.
            </p>
          </div>
        )}

        {strategy === "disqualify" && (
          <Banner variant="danger">Agent decided to end outreach</Banner>
        )}
        {strategy === "propose_call" && (
          <Banner variant="success">Agent is moving to schedule a call</Banner>
        )}

        {reasoning && (
          <>
            <BrainCard title="01 · Observation" accent="emerald" active={!!observation}>
              {!observation ? (
                <p className="text-xs text-slate-500">
                  Opening — no candidate reply to analyze
                </p>
              ) : (
                <div className="space-y-2">
                  {observation.sentiment && (
                    <Chip
                      label={observation.sentiment}
                      className={SENTIMENT_COLORS[observation.sentiment] ?? ""}
                    />
                  )}
                  {typeof observation.interest_signal === "number" && (
                    <p className="text-xs text-slate-400">
                      Δ interest{" "}
                      <span
                        className={
                          observation.interest_signal >= 0
                            ? "font-semibold text-emerald-400"
                            : "font-semibold text-red-400"
                        }
                      >
                        {observation.interest_signal >= 0 ? "+" : ""}
                        {observation.interest_signal}
                      </span>
                    </p>
                  )}
                  {observation.stage_signal && (
                    <p className="text-[11px] italic text-slate-500">
                      {observation.stage_signal}
                    </p>
                  )}
                  {observation.objections && observation.objections.length > 0 && (
                    <MiniList label="Objections" items={observation.objections} />
                  )}
                  {observation.questions && observation.questions.length > 0 && (
                    <MiniList label="Questions" items={observation.questions} />
                  )}
                </div>
              )}
            </BrainCard>

            <BrainCard title="02 · Plan" accent="violet" active={!!plan}>
              {plan && (
                <div className="space-y-2">
                  <Chip
                    label={plan.chosen_strategy.replace(/_/g, " ")}
                    className={STRATEGY_COLORS[plan.chosen_strategy] ?? ""}
                  />
                  <p className="text-[11px] leading-relaxed text-slate-400">
                    &ldquo;{plan.rationale}&rdquo;
                  </p>
                </div>
              )}
            </BrainCard>

            <BrainCard title="03 · Self-critique" accent="amber" active={!!critique}>
              {critique ? (
                <div className="space-y-2">
                  <p className="max-h-28 overflow-y-auto text-[11px] leading-relaxed text-slate-500">
                    {summarizeCritique(critique)}
                  </p>
                  {draftMessage && finalMessage && draftMessage !== finalMessage && (
                    <div>
                      <button
                        type="button"
                        onClick={() => setShowDraft((s) => !s)}
                        className="text-[10px] font-medium uppercase tracking-wider text-emerald-500 hover:text-emerald-400"
                      >
                        {showDraft ? "→ Revised" : "→ Draft"}
                      </button>
                      <pre className="mt-2 max-h-24 overflow-y-auto whitespace-pre-wrap rounded border border-white/5 bg-black/40 p-2 text-[10px] text-slate-400">
                        {showDraft ? draftMessage : finalMessage}
                      </pre>
                    </div>
                  )}
                  {draftMessage === finalMessage && (
                    <span className="inline-block rounded bg-slate-800/50 px-2 py-0.5 text-[10px] text-slate-500">
                      No revision needed
                    </span>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-600">—</p>
              )}
            </BrainCard>
          </>
        )}
      </div>

      {state && (
        <div className="border-t border-emerald-500/10 bg-black/50 p-5">
          <div className="flex items-end justify-between gap-4">
            <div className="flex-1">
              <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span>Interest score</span>
                <span className="font-display text-lg font-bold text-white">
                  {interest}
                  <span className="text-sm font-normal text-slate-500">/100</span>
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-900">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${interestGradient} shadow-[0_0_12px_rgba(16,185,129,0.4)] transition-all duration-700`}
                  style={{ width: `${interest}%` }}
                />
              </div>
            </div>
            <Chip
              label={state.stage.replace(/_/g, " ")}
              className="border-slate-600/30 bg-slate-800/50 text-slate-400"
            />
          </div>
        </div>
      )}
    </section>
  );
}

function summarizeCritique(text: string): string {
  const verdict = text.match(/\*\*Overall[^*]*\*\*[^*]*/i)?.[0];
  if (verdict) return verdict.replace(/\*\*/g, "").slice(0, 350);
  return text.slice(0, 350) + (text.length > 350 ? "…" : "");
}

function BrainCard({
  title,
  accent,
  active,
  children,
}: {
  title: string;
  accent: "emerald" | "violet" | "amber";
  active?: boolean;
  children: ReactNode;
}) {
  const border =
    accent === "emerald"
      ? "border-l-emerald-400/60"
      : accent === "violet"
        ? "border-l-violet-400/60"
        : "border-l-amber-400/60";
  return (
    <div
      className={`rounded-lg border border-white/[0.05] border-l-2 ${border} p-3 transition-all ${
        active ? "bg-emerald-950/20" : "bg-black/30"
      }`}
    >
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      {children}
    </div>
  );
}

function Chip({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-block rounded border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${className}`}
    >
      {label}
    </span>
  );
}

function MiniList({ label, items }: { label: string; items: string[] }) {
  return (
    <div>
      <p className="text-[10px] text-slate-600">{label}</p>
      <ul className="mt-0.5 space-y-0.5 text-[11px] text-slate-400">
        {items.map((item, i) => (
          <li key={i}>· {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Banner({
  variant,
  children,
}: {
  variant: "danger" | "success";
  children: ReactNode;
}) {
  const styles =
    variant === "danger"
      ? "border-red-500/30 bg-red-950/40 text-red-300"
      : "border-emerald-500/30 bg-emerald-950/40 text-emerald-300";
  return (
    <div className={`rounded-lg border px-3 py-2 text-[11px] font-medium ${styles}`}>
      {children}
    </div>
  );
}
