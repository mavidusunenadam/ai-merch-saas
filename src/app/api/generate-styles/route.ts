import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { openai } from "@/lib/openai";
import { STYLE_CONFIG, STYLE_ORDER } from "@/lib/image-prompts";
import { GenerateStylesResponse, StyleResult } from "@/lib/types";
import { dataUrlToBuffer, fileExtFromMime, safeFileName } from "@/lib/utils";

export const runtime = "nodejs";

async function generateOneStyle(file: File, key: keyof typeof STYLE_CONFIG) {
  const style = STYLE_CONFIG[key];

 const response = await openai.images.edit({
  model: "gpt-image-1.5",
  image: file,
  prompt: `${style.prompt}

Important composition rules:
- Preserve the full original photo composition.
- Do not crop the top of the head.
- Do not crop the body, outfit, arms, or feet if visible.
- Keep the subject fully in frame.
- Maintain the original framing and camera distance as much as possible.
- Do not zoom in.`,
  size: "auto",
  quality: "medium",
  output_format: "png"
});

  const base64 = response.data?.[0]?.b64_json;

  if (!base64) {
    throw new Error(`${style.label} için görsel üretilemedi.`);
  }

  return {
    key,
    label: style.label,
    prompt: style.prompt,
    base64
  };
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const input = formData.get("file");

    if (!input || !(input instanceof File)) {
      return NextResponse.json<GenerateStylesResponse>(
        {
          success: false,
          error: "Geçerli bir görsel yüklenmedi."
        },
        { status: 400 }
      );
    }

    if (!input.type.startsWith("image/")) {
      return NextResponse.json<GenerateStylesResponse>(
        {
          success: false,
          error: "Yalnızca görsel dosyaları yüklenebilir."
        },
        { status: 400 }
      );
    }

    const originalBytes = await input.arrayBuffer();
    const ext = fileExtFromMime(input.type);
    const baseName = safeFileName(input.name || "photo");
    const timestamp = Date.now();

    const originalBlob = await put(
      `uploads/${timestamp}-${baseName}.${ext}`,
      Buffer.from(originalBytes),
      {
        access: "public",
        addRandomSuffix: true,
        contentType: input.type
      }
    );

    const stylePromises = STYLE_ORDER.map(async (styleKey) => {
      const freshFile = new File([originalBytes], `${baseName}.${ext}`, {
        type: input.type
      });

      const generated = await generateOneStyle(freshFile, styleKey);

      const outputBuffer = dataUrlToBuffer(generated.base64);

      const outputBlob = await put(
        `generated/${timestamp}-${baseName}-${styleKey}.png`,
        outputBuffer,
        {
          access: "public",
          addRandomSuffix: true,
          contentType: "image/png"
        }
      );

      const result: StyleResult = {
        key: generated.key,
        label: generated.label,
        prompt: generated.prompt,
        url: outputBlob.url
      };

      return result;
    });

    const results = await Promise.all(stylePromises);

    return NextResponse.json<GenerateStylesResponse>({
      success: true,
      originalUrl: originalBlob.url,
      results
    });
  } catch (error) {
    console.error("GENERATE STYLES ERROR:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Görseller üretilirken hata oluştu.";

    return NextResponse.json<GenerateStylesResponse>(
      {
        success: false,
        error: message
      },
      { status: 500 }
    );
  }
}