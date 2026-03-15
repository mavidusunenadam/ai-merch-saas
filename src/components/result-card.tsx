"use client";

import { StyleResult } from "@/lib/types";

type Props = {
  item: StyleResult;
  isSelected: boolean;
  onSelect: () => void;
};

export default function ResultCard({ item, isSelected, onSelect }: Props) {
  return (
    <div
      className={`card card-pad click-card ${isSelected ? "selected" : ""}`}
      onClick={onSelect}
    >
      <div className="flex-between mb-3">
        <h3 className="text-lg font-bold">{item.label}</h3>
        <span className="badge">{isSelected ? "Seçildi" : "Hazır"}</span>
      </div>

      <img src={item.url} alt={item.label} className="result-image" />

      <div className="mt-4">
        <button type="button" className="btn btn-primary" onClick={onSelect}>
          {isSelected ? "Seçili Tasarım" : "Bunu Seç"}
        </button>
      </div>
    </div>
  );
}