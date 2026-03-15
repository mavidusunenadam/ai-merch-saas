"use client";

import {
  DesignPlacement,
  MockupColor,
  MockupSide,
  TextLayer
} from "@/lib/types";
import MockupEditor from "@/components/mockup-editor";

type Props = {
  designUrl: string | null;
  color: MockupColor;
  side: MockupSide;
  placement: DesignPlacement;
  textLayer: TextLayer;
  backgroundRemoving: boolean;
  usingBgRemoved: boolean;
  onColorChange: (color: MockupColor) => void;
  onSideChange: (side: MockupSide) => void;
  onPlacementChange: (placement: DesignPlacement) => void;
  onTextLayerChange: (textLayer: TextLayer) => void;
  onRemoveBackground: () => void;
  onUseOriginal: () => void;
};

export default function StepMockup({
  designUrl,
  color,
  side,
  placement,
  textLayer,
  backgroundRemoving,
  usingBgRemoved,
  onColorChange,
  onSideChange,
  onPlacementChange,
  onTextLayerChange,
  onRemoveBackground,
  onUseOriginal
}: Props) {
  return (
    <div className="card card-pad">
      <div className="mb-6">
        <span className="badge">3. Adım</span>
        <h2 className="section-title">Mockup tasarla</h2>
        <p className="section-text">
          Tasarımını mockup üzerinde taşı, büyüt, küçült. İstersen yazı ekle ve arka planı kaldır.
        </p>
      </div>

      <div className="btn-row mb-6">
        <button
          type="button"
          onClick={() => onColorChange("white")}
          className={`btn ${color === "white" ? "btn-primary" : "btn-secondary"}`}
        >
          Beyaz
        </button>

        <button
          type="button"
          onClick={() => onColorChange("black")}
          className={`btn ${color === "black" ? "btn-primary" : "btn-secondary"}`}
        >
          Siyah
        </button>

        <button
          type="button"
          onClick={() => onSideChange("front")}
          className={`btn ${side === "front" ? "btn-primary" : "btn-secondary"}`}
        >
          Ön
        </button>

        <button
          type="button"
          onClick={() => onSideChange("back")}
          className={`btn ${side === "back" ? "btn-primary" : "btn-secondary"}`}
        >
          Arka
        </button>
      </div>

      <MockupEditor
        designUrl={designUrl}
        color={color}
        side={side}
        placement={placement}
        textLayer={textLayer}
        backgroundRemoving={backgroundRemoving}
        usingBgRemoved={usingBgRemoved}
        onPlacementChange={onPlacementChange}
        onTextLayerChange={onTextLayerChange}
        onRemoveBackground={onRemoveBackground}
        onUseOriginal={onUseOriginal}
      />
    </div>
  );
}