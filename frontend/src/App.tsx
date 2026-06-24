import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";
import type { Company } from "./lib/supabase";

export default function App() {
  const [companies, setCompanies] = useState<
    Pick<Company, "id" | "name" | "tone_preference">[]
  >([]);
  const [dbStatus, setDbStatus] = useState<"loading" | "ok" | "error">(
    "loading",
  );
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    async function checkDb() {
      const { data, error } = await supabase
        .from("companies")
        .select("id, name, tone_preference")
        .order("created_at");

      if (error) {
        setDbStatus("error");
        setDbError(error.message);
        return;
      }

      setCompanies(data ?? []);
      setDbStatus("ok");
    }

    void checkDb();
  }, []);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">PSVIEW Agent</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Autonomous candidate engagement demo
        </p>
      </header>

      <div className="space-y-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
          <h2 className="mb-2 text-sm font-medium text-zinc-300">
            Phase 1 — Database
          </h2>
          {dbStatus === "loading" && (
            <p className="text-sm text-zinc-400">Checking Supabase connection…</p>
          )}
          {dbStatus === "error" && (
            <p className="text-sm text-red-400">
              DB error: {dbError}. Run migrations with{" "}
              <code className="text-zinc-300">supabase db push</code>.
            </p>
          )}
          {dbStatus === "ok" && (
            <p className="text-sm text-emerald-400">
              Connected — {companies.length} seed companies loaded.
            </p>
          )}
        </div>

        {companies.length > 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="mb-3 text-sm font-medium text-zinc-300">
              Seed companies
            </h2>
            <ul className="space-y-2 text-sm text-zinc-400">
              {companies.map((c) => (
                <li key={c.id}>
                  <span className="text-zinc-200">{c.name}</span>
                  {c.tone_preference && (
                    <span className="text-zinc-500"> — {c.tone_preference}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
