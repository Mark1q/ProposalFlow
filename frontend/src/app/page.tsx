"use client"; // This is required for interactivity (state/buttons)

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { callApi } from "./api";

export default function Home() {
  const [proposalId, setProposalId] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFetch = async () => {
    if (!proposalId) return;
    
    setLoading(true);
    setError("");
    setMarkdown(""); // Clear previous results

    try {
      const data = await callApi(proposalId) as any;
      
      setMarkdown(data.finalMarkdown || "No content found in API response.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto py-12 px-6">
      <div className="flex flex-col gap-4 mb-10 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-bold">Proposal Viewer</h1>
        
        <div className="flex gap-2">
          <input
            type="text"
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
            placeholder="Enter Proposal ID (e.g., 123)"
            className="flex-1 px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-black"
          />
          <button
            onClick={handleFetch}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg disabled:opacity-50 transition-colors"
          >
            {loading ? "Fetching..." : "Fetch"}
          </button>
        </div>

        {error && <p className="text-red-500 text-sm">Error: {error}</p>}
      </div>

      {/* Render Markdown result */}
      {markdown && (
        <article className="prose prose-zinc dark:prose-invert max-w-none">
          <ReactMarkdown>
            {markdown}
          </ReactMarkdown>
        </article>
      )}
    </main>
  );
}