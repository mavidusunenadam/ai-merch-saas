"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
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

type GeneratedResult = {
  id: string;
  label: string;
  imageUrl: string;
};

export default function BuilderPage() {
  const [prompts, setPrompts] = useState<PromptPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [builderReady, setBuilderReady] = useState(true);
  const [builderMessage, setBuilderMessage] = useState("");

  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [creatingSession, setCreatingSession] = useState(false);
  const [sessionMessage, setSessionMessage] = useState("");
  const [createdSessionId, setCreatedSessionId] = useState<string | null>(null);
  const [creditsRemaining, setCreditsRemaining] = useState<number | null>(null);
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [selectedResultId, setSelectedResultId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savingResult, setSavingResult] = useState(false);
  const [resultMessage, setResultMessage] = useState("");

  useEffect(() => {
    const fetchBuilderData = async () => {
      try {
        const [healthRes, promptsRes, shopRes] = await Promise.all([
          fetchWithActiveShop("/api/storefront/health"),
          fetchWithActiveShop("/api/storefront/prompts"),
          fetchWithActiveShop("/api/dev/shop"),
        ]);

        const healthData = await healthRes.json();
        const promptsData = await promptsRes.json();
        const shopData = await shopRes.json();

        if (!healthData.ok) {
          setBuilderReady(false);
          setBuilderMessage(healthData.message || "Builder is not ready.");
        } else {
          setBuilderReady(true);
          setBuilderMessage("");
        }

        setPrompts(promptsData.prompts || []);
        setCreditsRemaining(shopData.creditsRemaining ?? null);
      } catch (error) {
        console.error("Failed to load builder data:", error);
        setBuilderReady(false);
        setBuilderMessage("Failed to load builder.");
      } finally {
        setLoading(false);
      }
    };

    fetchBuilderData();
  }, []);

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setSessionMessage("");
    setCreatedSessionId(null);
    setResults([]);
    setSelectedResultId(null);
    setResultMessage("");

    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (sessionId: string) => {
    try {
      setIsGenerating(true);

      const res = await fetchWithActiveShop("/api/builder/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate results");
      }

      setResults(data.results || []);
      setSessionMessage("Mock results generated successfully.");
    } catch (error) {
      console.error(error);
      setSessionMessage("Failed to generate results.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSession = async (mode: "generate" | "original") => {
    try {
      if (!uploadedImage) return;

      if (mode === "generate" && !selectedPromptId) {
        alert("Please select a style first.");
        return;
      }

      setCreatingSession(true);
      setSessionMessage("");
      setCreatedSessionId(null);
      setResults([]);
      setSelectedResultId(null);
      setResultMessage("");

      const res = await fetchWithActiveShop("/api/builder/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          selectedPromptId: mode === "generate" ? selectedPromptId : null,
          originalFileName: uploadedFileName || null,
          sourceImageUrl: uploadedImage,
          mode,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create session");
      }

      setCreatedSessionId(data.session.id);
      setCreditsRemaining(data.creditsRemaining ?? null);

      if (mode === "original") {
        setSessionMessage("Original photo flow started successfully.");
        return;
      }

      setSessionMessage("Session created. Generating mock results...");
      await handleGenerate(data.session.id);
    } catch (error) {
      console.error(error);
      setSessionMessage("Failed to create session.");
    } finally {
      setCreatingSession(false);
    }
  };

  const handleSaveSelectedResult = async () => {
    try {
      if (!createdSessionId) {
        alert("No session found.");
        return;
      }

      if (!selectedResultId) {
        alert("Please select a result first.");
        return;
      }

      const selectedResult = results.find((r) => r.id === selectedResultId);

      if (!selectedResult) {
        alert("Selected result not found.");
        return;
      }

      setSavingResult(true);
      setResultMessage("");

      const res = await fetchWithActiveShop("/api/builder/select-result", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId: createdSessionId,
          selectedResultId: selectedResult.id,
          finalImageUrl: selectedResult.imageUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to save selected result");
      }

      setResultMessage("Selected design saved successfully.");
      window.localStorage.setItem("latestBuilderSessionId", createdSessionId);
    } catch (error) {
      console.error(error);
      setResultMessage("Failed to save selected design.");
    } finally {
      setSavingResult(false);
    }
  };

  const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
  const selectedResult = results.find((r) => r.id === selectedResultId);

  const steps = useMemo(() => {
    return [
      {
        label: "Style",
        done: Boolean(selectedPromptId),
      },
      {
        label: "Upload",
        done: Boolean(uploadedImage),
      },
      {
        label: "Generate",
        done: results.length > 0,
      },
      {
        label: "Choose",
        done: Boolean(selectedResultId),
      },
      {
        label: "Save",
        done: resultMessage.toLowerCase().includes("successfully"),
      },
    ];
  }, [selectedPromptId, uploadedImage, results.length, selectedResultId, resultMessage]);

  if (loading) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="card">Loading builder styles...</div>
        </div>
      </main>
    );
  }

  if (!builderReady) {
    return (
      <main className="page-shell">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">AI Merch Builder</h1>
            <p className="page-subtitle">
              The store must finish setup before customers can use the builder.
            </p>
          </div>

          <div className="card border-yellow-300 bg-yellow-50">
            <h2 className="section-title">Builder not ready</h2>
            <p className="mt-3 text-sm text-yellow-900">{builderMessage}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <div className="page-container">
        <div className="page-header">
          <h1 className="page-title">AI Merch Builder</h1>
          <p className="page-subtitle">
            Choose a style, upload a photo, generate variations, and save the final design.
          </p>
        </div>

        <div className="card mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="section-title">Storefront Session</h2>
              <p className="muted-text mt-2">
                This is the customer-facing builder flow for the active merchant store.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="status-box">
                Credits remaining:{" "}
                <span className="font-semibold text-gray-900">
                  {creditsRemaining ?? "-"}
                </span>
              </div>

              {createdSessionId && (
                <div className="status-box">
                  Session:{" "}
                  <span className="font-semibold text-gray-900 break-all">
                    {createdSessionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <div
                key={step.label}
                className={`rounded-2xl border p-4 ${
                  step.done
                    ? "border-green-200 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Step {index + 1}
                </p>
                <p className="mt-2 text-sm font-semibold text-gray-900">
                  {step.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8">
            <div className="card">
              <div className="mb-5">
                <h2 className="section-title">1. Choose a Style</h2>
                <p className="muted-text mt-2">
                  Select one of the merchant-enabled AI styles.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-2">
                {prompts.map((prompt) => {
                  const isSelected = selectedPromptId === prompt.id;

                  return (
                    <button
                      key={prompt.id}
                      onClick={() => setSelectedPromptId(prompt.id)}
                      className={`card-soft text-left ${
                        isSelected ? "border-gray-900 ring-1 ring-gray-900/10" : ""
                      }`}
                    >
                      <div className="mb-3 inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700">
                        {prompt.key}
                      </div>

                      <h3 className="text-lg font-semibold text-gray-900">
                        {prompt.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-gray-500">
                        {prompt.description}
                      </p>

                      <div className="mt-4">
                        <span className={isSelected ? "btn-primary w-full" : "btn-secondary w-full"}>
                          {isSelected ? "Selected Style" : "Select Style"}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="card">
              <div className="mb-5">
                <h2 className="section-title">2. Upload Photo</h2>
                <p className="muted-text mt-2">
                  Upload the customer image that will be transformed into a merch design.
                </p>
              </div>

              <label className="block cursor-pointer rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center transition hover:bg-gray-100">
                <span className="text-sm font-semibold text-gray-900">
                  Choose image
                </span>
                <p className="mt-2 text-sm text-gray-500">
                  JPG, PNG or similar image formats
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>

              {uploadedFileName && (
                <div className="status-box mt-4">
                  Uploaded file:{" "}
                  <span className="font-semibold text-gray-900">
                    {uploadedFileName}
                  </span>
                </div>
              )}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={() => handleCreateSession("generate")}
                  disabled={!selectedPromptId || !uploadedImage || creatingSession || isGenerating}
                  className="btn-primary"
                >
                  {creatingSession || isGenerating ? "Processing..." : "Generate Design"}
                </button>

                <button
                  onClick={() => handleCreateSession("original")}
                  disabled={!uploadedImage || creatingSession || isGenerating}
                  className="btn-secondary"
                >
                  Continue with Original Photo
                </button>
              </div>

              {sessionMessage && (
                <div className="status-box mt-4">{sessionMessage}</div>
              )}
            </div>

            {results.length > 0 && (
              <div className="card">
                <div className="mb-5">
                  <h2 className="section-title">3. Generated Results</h2>
                  <p className="muted-text mt-2">
                    Choose the variation you want to continue with.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {results.map((result) => {
                    const isSelected = selectedResultId === result.id;

                    return (
                      <button
                        key={result.id}
                        onClick={() => setSelectedResultId(result.id)}
                        className={`card-soft text-left ${
                          isSelected ? "border-gray-900 ring-1 ring-gray-900/10" : ""
                        }`}
                      >
                        <div className="flex items-center justify-center rounded-xl bg-gray-100 p-3">
                          <img
                            src={result.imageUrl}
                            alt={result.label}
                            className="max-h-[220px] rounded-xl object-contain"
                          />
                        </div>

                        <h3 className="mt-4 text-base font-semibold text-gray-900">
                          {result.label}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {isSelected ? "Selected result" : "Click to select"}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-5">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Chosen Result
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    {selectedResult ? selectedResult.label : "No generated result selected yet."}
                  </p>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <button
                      onClick={handleSaveSelectedResult}
                      disabled={!selectedResultId || savingResult}
                      className="btn-primary"
                    >
                      {savingResult ? "Saving..." : "Use This Design"}
                    </button>

                    {resultMessage && <div className="status-box">{resultMessage}</div>}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-8">
            <div className="card">
              <div className="mb-5">
                <h2 className="section-title">Live Preview</h2>
                <p className="muted-text mt-2">
                  Review the uploaded image before generation.
                </p>
              </div>

              <div className="flex min-h-[380px] items-center justify-center rounded-2xl bg-gray-100 p-4">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Uploaded preview"
                    className="max-h-[340px] rounded-xl object-contain"
                  />
                ) : (
                  <p className="text-sm text-gray-500">No image uploaded yet.</p>
                )}
              </div>
            </div>

            <div className="card">
              <h2 className="section-title">Current Selection</h2>

              <div className="mt-4 space-y-4">
                <div className="status-box">
                  <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Style
                  </span>
                  <span className="mt-1 block font-semibold text-gray-900">
                    {selectedPrompt ? selectedPrompt.title : "Not selected"}
                  </span>
                </div>

                <div className="status-box">
                  <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Uploaded file
                  </span>
                  <span className="mt-1 block font-semibold text-gray-900 break-all">
                    {uploadedFileName || "No file uploaded"}
                  </span>
                </div>

                <div className="status-box">
                  <span className="block text-xs font-medium uppercase tracking-wide text-gray-500">
                    Final choice
                  </span>
                  <span className="mt-1 block font-semibold text-gray-900">
                    {selectedResult ? selectedResult.label : "No result selected"}
                  </span>
                </div>
              </div>

              {createdSessionId && resultMessage.toLowerCase().includes("successfully") && (
                <div className="mt-5">
                  <a
                    href="/builder/mockup"
                    className="btn-outline w-full"
                  >
                    Continue to Mockup
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
