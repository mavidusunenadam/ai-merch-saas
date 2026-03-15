"use client";

import { useState } from "react";
import ResultGrid from "./result-grid";
import { GenerateStylesResponse } from "@/lib/types";

async function compressImage(file: File): Promise<File> {
  const imageBitmap = await createImageBitmap(file);

  const maxWidth = 1600;
  const scale = Math.min(1, maxWidth / imageBitmap.width);

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(imageBitmap.width * scale);
  canvas.height = Math.round(imageBitmap.height * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context bulunamadı.");

  ctx.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.9);
  });

  if (!blob) throw new Error("Görsel sıkıştırılamadı.");

  return new File([blob], "upload.jpg", { type: "image/jpeg" });
}

export default function Uploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [data, setData] = useState<GenerateStylesResponse | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!file) {
      setError("Lütfen bir fotoğraf seç.");
      return;
    }

    setLoading(true);
    setError("");
    setData(null);

    try {
      const optimized = await compressImage(file);

      const formData = new FormData();
      formData.append("file", optimized);

      const res = await fetch("/api/generate-styles", {
        method: "POST",
        body: formData
      });

      const json: GenerateStylesResponse = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || "Bir hata oluştu.");
      }

      setData(json);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Bilinmeyen hata.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="card p-6 mt-8">
        <div className="flex flex-col gap-4">
          <div>
            <span className="badge mb-3">AI T-Shirt Generator</span>
            <h2 className="text-2xl font-bold">
              Fotoğrafını yükle, 4 farklı style otomatik oluşsun
            </h2>
            <p className="helper mt-2">
              Rockwell, Ghibli, Anime ve Karikatür versiyonları tek seferde
              üretilecek.
            </p>
          </div>

          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="input-file"
            onChange={(e) => {
              const selected = e.target.files?.[0] || null;
              setFile(selected);
              setData(null);
              setError("");

              if (selected) {
                setPreview(URL.createObjectURL(selected));
              } else {
                setPreview("");
              }
            }}
          />

          {preview && (
            <div className="card p-4">
              <p className="text-sm mb-3 text-gray-300">Yüklenen görsel</p>
              <img
                src={preview}
                alt="Preview"
                className="result-image"
                style={{ maxWidth: 420 }}
              />
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
            >
              {loading ? "Üretiliyor..." : "Tasarım Oluştur"}
            </button>
          </div>

          {error && (
            <div className="card p-4 border border-red-500/30">
              <p className="text-red-300">{error}</p>
            </div>
          )}
        </div>
      </form>

      {loading && (
        <div className="grid-results mt-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="card p-4 animate-pulse">
              <div className="h-6 w-40 bg-white/10 rounded mb-4" />
              <div className="aspect-square bg-white/10 rounded-2xl" />
              <div className="h-10 w-32 bg-white/10 rounded mt-4" />
            </div>
          ))}
        </div>
      )}

      {data?.results && <ResultGrid results={data.results} />}
    </>
  );
}