"use client";

type Props = {
  step: number;
  maxStep: number;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  nextLabel?: string;
};

export default function NavigationButtons({
  step,
  maxStep,
  onBack,
  onNext,
  nextDisabled = false,
  nextLabel
}: Props) {
  return (
    <div className="card card-pad mt-6">
      <div className="flex-between">
        <button
          type="button"
          onClick={onBack}
          disabled={step === 1}
          className="btn btn-secondary"
        >
          Geri
        </button>

        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="btn btn-primary"
        >
          {nextLabel || (step === maxStep ? "Tamamla" : "Sonraki")}
        </button>
      </div>
    </div>
  );
}