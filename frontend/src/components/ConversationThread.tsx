import type { Message } from "../lib/supabase";

type Props = {
  messages: Message[];
  candidateReply: string;
  loading: boolean;
  agentName?: string;
  hasConversation: boolean;
  hasAgentMessage: boolean;
  onReplyChange: (v: string) => void;
  onGenerateOpening: () => void;
  onSendReply: () => void;
  onNewChat: () => void;
};

const QUICK_REPLIES = [
  "Sounds interesting, tell me more",
  "Not looking right now, but curious",
  "What's the comp and equity?",
  "Stop contacting me",
];

export default function ConversationThread({
  messages,
  candidateReply,
  loading,
  agentName = "Agent",
  hasConversation,
  hasAgentMessage,
  onReplyChange,
  onGenerateOpening,
  onSendReply,
  onNewChat,
}: Props) {
  return (
    <section className="glass-card glass-card-glow flex h-full flex-col overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-black/25 px-5 py-4">
        <div>
          <div className="section-badge mb-2">
            <span className="section-badge-num">3</span>
            Simulate
          </div>
          <h2 className="font-display text-lg font-bold text-white">Conversation</h2>
          <p className="text-xs text-amber-400/70">Preview only — nothing is sent</p>
        </div>
        <button
          type="button"
          onClick={onNewChat}
          disabled={loading}
          className="btn-secondary shrink-0 text-xs"
          title="Start a fresh conversation with the same agent"
        >
          + New chat
        </button>
      </div>

      <div
        className="scroll-area flex-1 space-y-4 overflow-y-auto p-5"
        style={{ minHeight: 400 }}
      >
        {hasConversation && messages.length === 0 && !loading && (
          <EmptyState onGenerate={onGenerateOpening} />
        )}
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`animate-message-in flex gap-3 ${msg.role === "agent" ? "" : "flex-row-reverse"}`}
            style={{ animationDelay: `${i * 40}ms` }}
          >
            {msg.role === "agent" && (
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 text-xs font-bold text-white shadow-lg shadow-emerald-900/30">
                {agentName.charAt(0)}
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "agent"
                  ? "rounded-tl-md border border-emerald-500/15 bg-gradient-to-br from-emerald-950/50 to-emerald-950/20 text-slate-100 shadow-[0_4px_20px_rgba(16,185,129,0.06)]"
                  : "rounded-tr-md border border-slate-600/30 bg-slate-800/50 text-slate-200"
              }`}
            >
              <p
                className={`mb-2 text-[10px] font-semibold uppercase tracking-widest ${
                  msg.role === "agent" ? "text-emerald-400/80" : "text-slate-500"
                }`}
              >
                {msg.role === "agent" ? agentName : "Candidate (simulated)"}
              </p>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-xs font-bold text-emerald-400">
              {agentName.charAt(0)}
            </div>
            <div className="rounded-2xl rounded-tl-md border border-emerald-500/15 bg-emerald-950/25 px-5 py-4">
              <p className="typing-dots mb-1">
                <span /><span /><span />
              </p>
              <p className="text-xs text-emerald-500/60">Agent reasoning…</p>
            </div>
          </div>
        )}
      </div>

      {hasConversation && (
        <div className="border-t border-white/[0.06] bg-black/30 p-5">
          {!hasAgentMessage && (
            <button
              type="button"
              onClick={onGenerateOpening}
              disabled={loading}
              className="btn-primary mb-5 w-full"
            >
              Generate opening message
            </button>
          )}
          {hasAgentMessage && (
            <div className="mb-4 flex flex-wrap gap-2">
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type="button"
                  disabled={loading}
                  onClick={() => onReplyChange(q)}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-400 transition-colors hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          <label className="block text-sm">
            <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-slate-500">
              Simulate candidate reply
            </span>
            <textarea
              rows={3}
              value={candidateReply}
              onChange={(e) => onReplyChange(e.target.value)}
              disabled={loading || !hasAgentMessage}
              placeholder="Type how the candidate might respond — e.g. skeptical, interested, or hostile"
              className="input-field resize-none disabled:opacity-40"
            />
          </label>
          <button
            type="button"
            onClick={onSendReply}
            disabled={loading || !hasAgentMessage || !candidateReply.trim()}
            className="btn-secondary mt-4 w-full py-2.5"
          >
            Send as candidate →
          </button>
        </div>
      )}
    </section>
  );
}

function EmptyState({ onGenerate }: { onGenerate: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-emerald-500/20 bg-gradient-to-b from-emerald-950/20 to-transparent px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-2xl text-emerald-400">
        ◎
      </div>
      <p className="font-display text-lg font-bold text-white">Ready to simulate</p>
      <p className="mt-2 max-w-xs text-xs leading-relaxed text-slate-500">
        Generate the agent&apos;s opening outreach, then role-play as the candidate.
      </p>
      <button type="button" onClick={onGenerate} className="btn-primary mt-6 text-sm">
        Generate opening →
      </button>
    </div>
  );
}
