"use client";

import { useEffect, useState } from "react";
import { fetchWithActiveShop } from "@/lib/fetch-with-shop";

type PromptPreset = {
  id: string;
  key: string;
  title: string;
  description: string | null;
  promptText: string;
  previewImage: string | null;
  isActive: boolean;
  createdAt: string;
};

export default function PromptSelectionPage() {
  const [prompts, setPrompts] = useState<PromptPreset[]>([]);
  const [selectedPromptIds, setSelectedPromptIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [promptsRes, selectedRes] = await Promise.all([
          fetchWithActiveShop("/api/prompts"),
          fetchWithActiveShop("/api/shop/prompts"),
        ]);

        const promptsData = await promptsRes.json();
        const selectedData = await selectedRes.json();

        setPrompts(promptsData || []);
        setSelectedPromptIds(selectedData.selectedPromptIds || []);
      } catch (error) {
        console.error("Failed to load prompt data:", error);
        setMessage("Failed to load prompt presets.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTogglePrompt = (promptId: string) => {
    setMessage("");

    setSelectedPromptIds((prev) => {
      const isSelected = prev.includes(promptId);

      if (isSelected) {
        return prev.filter((id) => id !== promptId);
      }

      if (prev.length >= 4) {
        alert("You can select up to 4 styles only.");
        return prev;
      }

      return [...prev, promptId];
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");

      const res = await fetchWithActiveShop("/api/shop/prompts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptIds: selectedPromptIds,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save selections");
      }

      setMessage("Style selections saved successfully.");
    } catch (error) {
      console.error(error);
      setMessage("Failed to save style selections.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="card">Loading style presets...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">AI Style Presets</h1>
          <p className="page-subtitle">
            Choose up to 4 styles that customers will see in the merch builder.
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="section-title">Storefront Style Setup</h2>
              <p className="muted-text mt-2">
                Selected styles appear in the customer-facing builder experience.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="status-box">
                Selected:{" "}
                <span className="font-semibold text-gray-900">
                  {selectedPromptIds.length} / 4
                </span>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary"
              >
                {saving ? "Saving..." : "Save Selections"}
              </button>
            </div>
          </div>

          {message && (
            <div className="status-box mt-4">
              {message}
            </div>
          )}
        </div>

        <div className="grid-cards">
          {prompts.map((prompt) => {
            const isSelected = selectedPromptIds.includes(prompt.id);

            return (
              <div
                key={prompt.id}
                className={`card-soft ${
                  isSelected ? "border-gray-900 ring-1 ring-gray-900/10" : ""
                }`}
              >
                <div className="flex h-full flex-col">
                  <div className="mb-4">
                    <div className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                      {prompt.key}
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900">
                      {prompt.title}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-500">
                      {prompt.description || "No description available."}
                    </p>
                  </div>

                  <div className="mb-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Preview
                    </p>
                    <p className="mt-2 text-sm text-gray-600">
                      {prompt.previewImage || "No preview image yet"}
                    </p>
                  </div>

                  <div className="mb-5 flex-1 rounded-xl bg-gray-50 p-4">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Prompt
                    </p>
                    <p className="mt-2 line-clamp-5 text-sm leading-6 text-gray-600">
                      {prompt.promptText}
                    </p>
                  </div>

                  <button
                    onClick={() => handleTogglePrompt(prompt.id)}
                    className={isSelected ? "btn-primary w-full" : "btn-secondary w-full"}
                  >
                    {isSelected ? "Selected" : "Select Style"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
