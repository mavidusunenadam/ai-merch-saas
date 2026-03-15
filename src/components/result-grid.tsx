"use client";

import { StyleResult } from "@/lib/types";

type Props = {
  results: StyleResult[];
};

export default function ResultGrid({ results }: Props) {
  return (
    <div className="grid-results mt-6">
      {results.map((item) => (
        <div key={item.key} className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold">{item.label}</h3>
            <span className="badge">Ready</span>
          </div>

          <img
            src={item.url}
            alt={item.label}
            className="result-image"
          />

          <div className="mt-4 flex gap-3 flex-wrap">
            <a
              href={item.url}
              target="_blank"
              className="btn btn-secondary"
              rel="noreferrer"
            >
              Görseli Aç
            </a>

            <a
              href={item.url}
              download
              className="btn btn-primary"
            >
              İndir
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}