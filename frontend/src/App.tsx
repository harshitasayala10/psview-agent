import { useCallback, useState } from "react";
import AgentBrainPanel from "./components/AgentBrainPanel";
import CompanyForm, { type CompanyFormData } from "./components/CompanyForm";
import ConversationThread from "./components/ConversationThread";
import PersonaCard from "./components/PersonaCard";
import {
  runAgentTurn,
  supabase,
  synthesizePersona,
  type AgentTurnResult,
} from "./lib/api";
import { DEFAULT_INTENT, PSVIEW_DEMO, PSVIEW_SEED_COMPANY_ID } from "./lib/constants";
import type { Message, Persona, ConversationState } from "./lib/supabase";

const EMPTY_FORM: CompanyFormData = {
  name: "",
  one_liner: "",
  culture: "",
  profiles_hired: "",
  tone_preference: "",
  selling_points: "",
};

const DEFAULT_CANDIDATE = {
  name: "Alex Chen",
  profile:
    "Senior full-stack engineer, 5 years React/Node, Series B startup. Passive but curious about founding roles.",
};

export default function App() {
  const [form, setForm] = useState<CompanyFormData>(EMPTY_FORM);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [persona, setPersona] = useState<Persona | null>(null);
  const [agentConfigId, setAgentConfigId] = useState<string | null>(null);
  const [personaReused, setPersonaReused] = useState(false);

  const [candidateName, setCandidateName] = useState(DEFAULT_CANDIDATE.name);
  const [candidateProfile, setCandidateProfile] = useState(DEFAULT_CANDIDATE.profile);
  const [intent, setIntent] = useState(DEFAULT_INTENT);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [candidateReply, setCandidateReply] = useState("");

  const [reasoning, setReasoning] = useState<AgentTurnResult["reasoning"] | null>(null);
  const [conversationState, setConversationState] = useState<ConversationState | null>(
    null,
  );
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [finalMessage, setFinalMessage] = useState<string | null>(null);
  const [interestDelta, setInterestDelta] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onRetry, setOnRetry] = useState<(() => void) | null>(null);

  const fail = useCallback((message: string, retry?: () => void) => {
    setError(message);
    setOnRetry(retry ? () => retry : null);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    setOnRetry(null);
  }, []);

  const resetConversation = useCallback(() => {
    setConversationId(null);
    setMessages([]);
    setCandidateReply("");
    setReasoning(null);
    setConversationState(null);
    setDraftMessage(null);
    setFinalMessage(null);
    setInterestDelta(null);
  }, []);

  const refreshMessages = useCallback(async (convId: string) => {
    const { data, error: msgError } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at");

    if (msgError) throw new Error(msgError.message);
    setMessages((data ?? []) as Message[]);
  }, []);

  const applyTurnResult = useCallback((result: AgentTurnResult) => {
    setConversationState((prev) => {
      const prevScore = prev?.interest_score ?? 0;
      setInterestDelta(result.state.interest_score - prevScore);
      return result.state;
    });
    setReasoning(result.reasoning);
    setDraftMessage(result.draft_message);
    setFinalMessage(result.message);
  }, []);

  const hasAgentMessage = messages.some((m) => m.role === "agent");

  const createConversation = useCallback(async (configId?: string) => {
    const id = configId ?? agentConfigId;
    if (!id) return null;

    const { data: convo, error: convoError } = await supabase
      .from("conversations")
      .insert({
        agent_config_id: id,
        candidate_name: candidateName,
        candidate_profile: candidateProfile,
        intent,
      })
      .select("id, state")
      .single();

    if (convoError || !convo) throw new Error(convoError?.message ?? "Create failed");

    setConversationId(convo.id);
    setConversationState(convo.state as ConversationState);
    return convo.id;
  }, [agentConfigId, candidateName, candidateProfile, intent]);

  const handleFormChange = (newForm: CompanyFormData) => {
    setForm(newForm);
    if (companyId && newForm.name.trim() !== form.name.trim()) {
      setCompanyId(null);
    }
  };

  const applyPersonaResult = (result: Awaited<ReturnType<typeof synthesizePersona>>) => {
    setPersona(result.persona);
    setAgentConfigId(result.agent_config_id);
    setPersonaReused(result.reused === true);
  };

  const handleLoadDemo = () => {
    setForm(PSVIEW_DEMO);
    setCompanyId(PSVIEW_SEED_COMPANY_ID);
    resetConversation();
    setPersona(null);
    setAgentConfigId(null);
    setPersonaReused(false);
    clearError();
    document.getElementById("configure")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleRunDemo = async () => {
    setLoading(true);
    clearError();
    setForm(PSVIEW_DEMO);
    setCompanyId(PSVIEW_SEED_COMPANY_ID);
    resetConversation();
    setPersona(null);
    setAgentConfigId(null);
    setPersonaReused(false);

    try {
      const personaResult = await synthesizePersona(PSVIEW_SEED_COMPANY_ID);
      applyPersonaResult(personaResult);

      const convId = await createConversation(personaResult.agent_config_id);
      if (!convId) throw new Error("Failed to create conversation");

      const turnResult = await runAgentTurn(convId);
      applyTurnResult(turnResult);
      await refreshMessages(convId);

      requestAnimationFrame(() => {
        document.getElementById("simulate")?.scrollIntoView({ behavior: "smooth" });
      });
    } catch (e) {
      fail(e instanceof Error ? e.message : "Failed to run demo", handleRunDemo);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompany = async () => {
    setLoading(true);
    clearError();
    resetConversation();
    setPersona(null);
    setAgentConfigId(null);
    setPersonaReused(false);

    try {
      let cid = companyId;

      if (!cid) {
        const { data: company, error: insertError } = await supabase
          .from("companies")
          .insert({ ...form, raw_context: form })
          .select("id")
          .single();

        if (insertError || !company) {
          throw new Error(insertError?.message ?? "Insert failed");
        }

        cid = company.id;
        setCompanyId(cid);
      }

      if (!cid) throw new Error("No company id");

      const result = await synthesizePersona(cid);
      applyPersonaResult(result);
    } catch (e) {
      fail(
        e instanceof Error ? e.message : "Failed to generate persona",
        handleSubmitCompany,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRegeneratePersona = async () => {
    if (!companyId) return;
    setLoading(true);
    clearError();
    resetConversation();
    setPersona(null);
    setAgentConfigId(null);
    setPersonaReused(false);

    try {
      const result = await synthesizePersona(companyId, { force: true });
      applyPersonaResult(result);
    } catch (e) {
      fail(
        e instanceof Error ? e.message : "Failed to regenerate persona",
        handleRegeneratePersona,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStartConversation = async () => {
    if (!agentConfigId) return;
    setLoading(true);
    clearError();
    resetConversation();

    try {
      await createConversation();
    } catch (e) {
      fail(
        e instanceof Error ? e.message : "Failed to create conversation",
        handleStartConversation,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = async () => {
    if (!agentConfigId) return;
    setLoading(true);
    clearError();
    resetConversation();

    try {
      await createConversation();
    } catch (e) {
      fail(e instanceof Error ? e.message : "Failed to start new chat", handleNewChat);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateOpening = async () => {
    if (!conversationId || hasAgentMessage) return;
    setLoading(true);
    clearError();

    try {
      const result = await runAgentTurn(conversationId);
      applyTurnResult(result);
      await refreshMessages(conversationId);
    } catch (e) {
      fail(e instanceof Error ? e.message : "Agent turn failed", handleGenerateOpening);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!conversationId || !candidateReply.trim()) return;
    const convId = conversationId;
    const reply = candidateReply.trim();
    setCandidateReply("");
    setLoading(true);
    clearError();

    const attempt = async () => {
      setLoading(true);
      clearError();
      try {
        const result = await runAgentTurn(convId, reply);
        applyTurnResult(result);
        await refreshMessages(convId);
      } catch (e) {
        fail(e instanceof Error ? e.message : "Agent turn failed", attempt);
        setCandidateReply(reply);
      } finally {
        setLoading(false);
      }
    };

    await attempt();
  };

  const showHero = !conversationId;
  const step = !persona ? 1 : !conversationId ? 2 : 3;

  return (
    <div className="min-h-screen">
      <div className="ambient-bg" aria-hidden />

      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#06080f]/75 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="avatar-glow relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 font-display text-sm font-bold text-white">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              <span className="relative">P</span>
            </div>
            <div>
              <h1 className="font-display text-lg font-bold tracking-tight text-white">
                PSVIEW Agent
              </h1>
              <p className="text-[11px] text-slate-500">Autonomous candidate engagement</p>
            </div>
          </div>

          <div className="hidden md:block">
            <StepRail step={step} hasAgentMessage={hasAgentMessage} />
          </div>

          <button
            type="button"
            onClick={() => void handleRunDemo()}
            disabled={loading}
            className="btn-primary shrink-0 text-xs"
          >
            {loading ? "Running…" : "Run demo"}
          </button>
        </div>
      </header>

      {showHero && (
        <section className="relative mx-auto max-w-6xl px-6 pt-14 pb-4 lg:px-8 lg:pt-20">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
                <span className="relative h-1.5 w-1.5 rounded-full bg-emerald-400" />
              </span>
              Live agent demo
            </p>
            <h2 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              <span className="gradient-text">Self-configuring</span>
              <br />
              recruiting intelligence
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
              Feed company context. Watch the agent synthesize a persona, reason through
              every turn, and adapt its outreach — with the full cognitive loop exposed.
            </p>
          </div>

          <div className="animate-fade-up animate-fade-up-delay-1 mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={() => void handleRunDemo()}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Running demo…" : "Run demo →"}
            </button>
            <button
              type="button"
              onClick={handleLoadDemo}
              disabled={loading}
              className="btn-secondary border-emerald-800/30 text-emerald-300"
            >
              Configure manually
            </button>
          </div>

          <div className="animate-fade-up animate-fade-up-delay-2 mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <div className="stat-pill">
              <span className="stat-pill-value">3</span>
              <span className="stat-pill-label">Reasoning steps</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-value">0</span>
              <span className="stat-pill-label">Hardcoded personas</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-value">∞</span>
              <span className="stat-pill-label">Company contexts</span>
            </div>
            <div className="stat-pill">
              <span className="stat-pill-value text-emerald-400">Safe</span>
              <span className="stat-pill-label">Preview only</span>
            </div>
          </div>
        </section>
      )}

      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8 lg:px-8">
        {error && (
          <div className="animate-fade-up flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
            <span>{error}</span>
            {onRetry && (
              <button
                type="button"
                onClick={() => void onRetry()}
                disabled={loading}
                className="btn-secondary shrink-0 border-red-500/30 py-1.5 text-xs text-red-200"
              >
                Try again
              </button>
            )}
          </div>
        )}

        <div id="configure" className="animate-fade-up animate-fade-up-delay-2">
          <CompanyForm
            form={form}
            loading={loading}
            hasPersona={!!persona}
            onChange={handleFormChange}
            onSubmit={() => void handleSubmitCompany()}
            onLoadDemo={handleLoadDemo}
          />
        </div>

        {persona && (
          <div className="animate-fade-up">
            <PersonaCard
              persona={persona}
              reused={personaReused}
              candidateName={candidateName}
              candidateProfile={candidateProfile}
              intent={intent}
              loading={loading}
              onCandidateNameChange={setCandidateName}
              onCandidateProfileChange={setCandidateProfile}
              onIntentChange={setIntent}
              onStartConversation={() => void handleStartConversation()}
              onRegenerate={() => void handleRegeneratePersona()}
            />
          </div>
        )}

        {conversationId && (
          <div id="simulate" className="animate-fade-up grid gap-6 lg:grid-cols-2">
            <ConversationThread
              messages={messages}
              candidateReply={candidateReply}
              loading={loading}
              agentName={persona?.agent_name}
              hasConversation={!!conversationId}
              hasAgentMessage={hasAgentMessage}
              onReplyChange={setCandidateReply}
              onGenerateOpening={() => void handleGenerateOpening()}
              onSendReply={() => void handleSendReply()}
              onNewChat={() => void handleNewChat()}
            />
            <AgentBrainPanel
              reasoning={reasoning}
              state={conversationState}
              draftMessage={draftMessage}
              finalMessage={finalMessage}
              interestDelta={interestDelta}
              loading={loading}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-white/[0.05] py-8 text-center">
        <p className="text-xs text-slate-600">
          Built for PSVIEW — agent intelligence surfaced by design
        </p>
      </footer>
    </div>
  );
}

function StepRail({
  step,
  hasAgentMessage,
}: {
  step: number;
  hasAgentMessage: boolean;
}) {
  const steps = [
    { n: 1, label: "Configure" },
    { n: 2, label: "Persona" },
    { n: 3, label: "Simulate" },
  ];

  return (
    <div className="flex items-center gap-1">
      {steps.map((s, i) => {
        const done = s.n < step || (s.n === 3 && hasAgentMessage);
        const active = s.n === step;
        return (
          <div key={s.n} className="flex items-center">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                active
                  ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25"
                  : done
                    ? "text-slate-400"
                    : "text-slate-600"
              }`}
            >
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  active
                    ? "bg-emerald-500 text-white"
                    : done
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-slate-800 text-slate-500"
                }`}
              >
                {done && !active ? "✓" : s.n}
              </span>
              {s.label}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`mx-1 h-px w-6 sm:w-10 ${
                  s.n < step ? "bg-emerald-500/40" : "bg-slate-800"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
