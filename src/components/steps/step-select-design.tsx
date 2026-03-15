"use client";

import { StyleResult } from "@/lib/types";

type Props = {
  designs: StyleResult[];
  selectedDesign: StyleResult | null;
  originalImageUrl?: string;
  onUseOriginalImage: () => void;
  onSelectDesign: (design: StyleResult) => void;
};

export default function StepSelectDesign({
  designs,
  selectedDesign,
  originalImageUrl,
  onUseOriginalImage,
  onSelectDesign
}: Props) {
  return (
    <div className="card card-pad">
      <div className="mb-6">
        <span className="badge">2. Adım</span>
        <h2 className="section-title">Tasarım seç</h2>
        <p className="section-text">
          İstersen AI tarafından oluşturulan stillerden birini seç, istersen orijinal fotoğrafınla devam et.
        </p>
      </div>

      {originalImageUrl && (
        <div className="card card-pad mb-6">
          <h3 className="font-bold mb-3">Orijinal fotoğrafla devam et</h3>

          <div className="original-design-box">
            <img
              src={originalImageUrl}
              alt="Original upload"
              className="result-image"
            />
          </div>

          <div className="mt-4">
            <button
              type="button"
              className="btn btn-primary"
              onClick={onUseOriginalImage}
            >
              Orijinal fotoğrafı kullan
            </button>
          </div>
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-bold">AI ile oluşturulan tasarımlar</h3>
      </div>

      <div className="grid-results">
        {designs.map((design) => (
          <button
            key={design.key}
            type="button"
            className={`card card-pad click-card ${
              selectedDesign?.key === design.key ? "selected" : ""
            }`}
            onClick={() => onSelectDesign(design)}
          >
            <img
              src={design.url}
              alt={design.label}
              className="result-image"
            />
            <p className="mt-3 font-bold">{design.label}</p>
          </button>
        ))}
      </div>
    </div>
  );
}