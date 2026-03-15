"use client";

import {
  DesignPlacement,
  MockupColor,
  MockupSide,
  TextLayer
} from "@/lib/types";

type Props = {
  designUrl: string | null;
  color: MockupColor;
  side: MockupSide;
  placement: DesignPlacement;
  textLayer: TextLayer;
  editable?: boolean;
  onDesignPointerDown?: (e: React.PointerEvent) => void;
  onDesignResizePointerDown?: (e: React.PointerEvent) => void;
  onTextPointerDown?: (e: React.PointerEvent) => void;
  onTextResizePointerDown?: (e: React.PointerEvent) => void;
  containerRef?: React.RefObject<HTMLDivElement | null>;
};

function getMockupPath(color: MockupColor, side: MockupSide) {
  return `/mockups/${color}-${side}.png`;
}

export default function MockupPreview({
  designUrl,
  color,
  side,
  placement,
  textLayer,
  editable = false,
  onDesignPointerDown,
  onDesignResizePointerDown,
  onTextPointerDown,
  onTextResizePointerDown,
  containerRef
}: Props) {
  const mockupPath = getMockupPath(color, side);

  return (
    <div ref={containerRef} className="mockup-wrap editor-surface">
      <img src={mockupPath} alt="Mockup" className="mockup-base" />

      {designUrl && (
        <div
          className={`design-layer ${editable ? "is-editable" : ""}`}
          style={{
            left: `${placement.x}%`,
            top: `${placement.y}%`,
            width: `${placement.width}%`
          }}
          onPointerDown={editable ? onDesignPointerDown : undefined}
        >
          <img
            src={designUrl}
            alt="Design"
            className="design-layer-image free-media"
            draggable={false}
          />

          {editable && (
            <div
              className="resize-handle"
              onPointerDown={onDesignResizePointerDown}
            />
          )}
        </div>
      )}

      {textLayer.text.trim() && (
        <div
          className={`text-layer ${editable ? "is-editable" : ""} ${
            textLayer.color === "#111111" ? "text-dark" : "text-light"
          }`}
          style={{
            left: `${textLayer.x}%`,
            top: `${textLayer.y}%`,
            fontSize: `${textLayer.fontSize}px`,
            color: textLayer.color
          }}
          onPointerDown={editable ? onTextPointerDown : undefined}
        >
          <span>{textLayer.text}</span>

          {editable && (
            <div
              className="resize-handle text-resize-handle"
              onPointerDown={onTextResizePointerDown}
            />
          )}
        </div>
      )}
    </div>
  );
}