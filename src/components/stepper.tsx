"use client";

import { StepKey } from "@/lib/types";

const steps: { id: StepKey; title: string }[] = [
  { id: 1, title: "Fotoğraf" },
  { id: 2, title: "Tasarım Seç" },
  { id: 3, title: "Mockup" },
  { id: 4, title: "Ürün" },
  { id: 5, title: "Özet" }
];

type Props = {
  currentStep: StepKey;
};

export default function Stepper({ currentStep }: Props) {
  return (
    <div className="card card-pad mb-6">
      <div className="step-grid">
        {steps.map((step) => {
          const isActive = currentStep === step.id;
          const isDone = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={`step-box ${isActive ? "active" : ""} ${isDone ? "done" : ""}`}
            >
              <div className="step-small">Adım {step.id}</div>
              <div className="step-title">{step.title}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}