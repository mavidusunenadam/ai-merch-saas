import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

function dataUrlToBuffer(dataUrl: string) {
  const base64 = dataUrl.split(",")[1];
  return Buffer.from(base64, "base64");
}

async function downloadFileAsBuffer(url: string) {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Ham tasarım indirilemedi.");
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      rawDesignUrl,
      finalPrintDataUrl,
      mockupPreviewDataUrl
    } = body;

    if (!rawDesignUrl || !finalPrintDataUrl) {
      return NextResponse.json(
        { success: false, error: "Eksik veri gönderildi." },
        { status: 400 }
      );
    }

    const timestamp = Date.now();

    const rawDesignBuffer = await downloadFileAsBuffer(rawDesignUrl);
    const finalPrintBuffer = dataUrlToBuffer(finalPrintDataUrl);

    const rawDesignBlob = await put(
      `exports/${timestamp}-raw-design.png`,
      rawDesignBuffer,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: "image/png"
      }
    );

    const finalPrintBlob = await put(
      `exports/${timestamp}-final-print.png`,
      finalPrintBuffer,
      {
        access: "public",
        addRandomSuffix: true,
        contentType: "image/png"
      }
    );

    let mockupPreviewUrl: string | null = null;

    if (mockupPreviewDataUrl) {
      const mockupPreviewBuffer = dataUrlToBuffer(mockupPreviewDataUrl);

      const mockupBlob = await put(
        `exports/${timestamp}-mockup-preview.png`,
        mockupPreviewBuffer,
        {
          access: "public",
          addRandomSuffix: true,
          contentType: "image/png"
        }
      );

      mockupPreviewUrl = mockupBlob.url;
    }

    return NextResponse.json({
      success: true,
      rawDesignUrl: rawDesignBlob.url,
      finalPrintUrl: finalPrintBlob.url,
      mockupPreviewUrl
    });
  } catch (error) {
    console.error("SAVE DESIGN OUTPUT ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Dosyalar kaydedilirken hata oluştu."
      },
      { status: 500 }
    );
  }
}