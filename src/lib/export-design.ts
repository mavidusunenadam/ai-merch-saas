import {
  DesignPlacement,
  TextLayer
} from "@/lib/types";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function getContainSize(
  imageWidth: number,
  imageHeight: number,
  boxWidth: number
) {
  const ratio = imageWidth / imageHeight;

  if (ratio >= 1) {
    return {
      width: boxWidth,
      height: boxWidth / ratio
    };
  }

  return {
    width: boxWidth * ratio,
    height: boxWidth
  };
}

export async function renderFinalPrintPng(params: {
  designUrl: string;
  placement: DesignPlacement;
  textLayer: TextLayer;
}) {
  const { designUrl, placement, textLayer } = params;

  const canvas = document.createElement("canvas");
  canvas.width = 4000;
  canvas.height = 5000;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context bulunamadı.");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const designImg = await loadImage(designUrl);

  const designCenterX = (placement.x / 100) * canvas.width;
  const designCenterY = (placement.y / 100) * canvas.height;
  const designWidth = (placement.width / 100) * canvas.width;

  const contained = getContainSize(
    designImg.naturalWidth,
    designImg.naturalHeight,
    designWidth
  );

  const drawX = designCenterX - contained.width / 2;
  const drawY = designCenterY - contained.height / 2;

  ctx.drawImage(designImg, drawX, drawY, contained.width, contained.height);

  if (textLayer.text.trim()) {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `800 ${Math.round((textLayer.fontSize / 100) * canvas.width)}px Arial`;

    const textX = (textLayer.x / 100) * canvas.width;
    const textY = (textLayer.y / 100) * canvas.height;

    if (textLayer.color === "#111111") {
      ctx.lineWidth = Math.max(10, canvas.width * 0.0025);
      ctx.strokeStyle = "rgba(255,255,255,0.95)";
      ctx.strokeText(textLayer.text, textX, textY);
      ctx.fillStyle = "#111111";
      ctx.fillText(textLayer.text, textX, textY);
    } else {
      ctx.shadowColor = "rgba(0,0,0,0.35)";
      ctx.shadowBlur = 24;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(textLayer.text, textX, textY);
    }

    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}