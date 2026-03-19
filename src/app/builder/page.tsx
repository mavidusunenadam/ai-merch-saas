"use client";

import { useEffect, useState } from "react";
import { fetchWithActiveShop } from "@/lib/fetch-with-shop";
import { getShopFromUrl } from "@/lib/shop-context";

type Prompt = {
  id: string;
  key: string;
  title: string;
  description: string;
  previewImage: string;
};

type GenerateResult = {
  key: string;
  title: string;
  url: string;
};

export default function BuilderPage() {
  const [loading, setLoading] = useState(true);
  const [builderReady, setBuilderReady] = useState(false);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [results, setResults] = useState<GenerateResult[]>([]);
  const [generating, setGenerating] = useState(false);

  const shop = getShopFromUrl();

  useEffect(() => {
    async function init() {
      try {
        const [healthRes, promptRes] = await Promise.all([
          fetchWithActiveShop("/api/storefront/health"),
          fetchWithActiveShop(
            `/api/storefront/prompts?shop=${encodeURIComponent(shop || "")}`
          ),
        ]);

        const health = await healthRes.json();
        const promptData = await promptRes.json();

        if (health.status === "ok") {
          setBuilderReady(true);
        }

        setPrompts(promptData.prompts || []);
      } catch (error) {
        console.error("Builder init error:", error);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [shop]);

  async function handleGenerate() {
    if (!file) return;

    setGenerating(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetchWithActiveShop(
        `/api/generate-styles?shop=${encodeURIComponent(shop || "")}`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Generation failed");
        return;
      }

      setResults(data.results || []);
    } catch (error) {
      console.error("Generate error:", error);
      alert("AI generation failed");
    } finally {
      setGenerating(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Loading builder...</h2>
      </div>
    );
  }

  if (!builderReady) {
    return (
      <div style={{ padding: 40 }}>
        <h2>Builder not ready</h2>
        <p>Please check your store configuration.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>AI Merch Builder</h1>

      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      </div>

      <button
        onClick={handleGenerate}
        disabled={!file || generating}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#000",
          color: "#fff",
          border: "none",
          cursor: "pointer",
        }}
      >
        {generating ? "Generating..." : "Generate Designs"}
      </button>

      {results.length > 0 && (
        <div
          style={{
            marginTop: 40,
            display: "grid",
            gridTemplateColumns: "repeat(2,1fr)",
            gap: 20,
          }}
        >
          {results.map((result) => (
            <div key={result.key}>
              <h4>{result.title}</h4>
              <img
                src={result.url}
                style={{
                  width: "100%",
                  borderRadius: 8,
                }}
              />
            </div>
          ))}
        </div>
      )}

      {prompts.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3>Active Styles</h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 16,
              marginTop: 16,
            }}
          >
            {prompts.map((prompt) => (
              <div
                key={prompt.id}
                style={{
                  border: "1px solid #eee",
                  padding: 12,
                  borderRadius: 8,
                }}
              >
                <img
                  src={prompt.previewImage}
                  style={{ width: "100%" }}
                />
                <h4>{prompt.title}</h4>
                <p style={{ fontSize: 12 }}>{prompt.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}