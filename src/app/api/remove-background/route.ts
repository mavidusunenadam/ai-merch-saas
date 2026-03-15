import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const runtime = "nodejs";

const REMOVE_BG_API_KEY = process.env.REMOVE_BG_API_KEY;

async function removeBackgroundWithRemoveBg(inputFile: File) {
  if (!REMOVE_BG_API_KEY) {
    throw new Error("REMOVE_BG_API_KEY tanımlı değil.");
  }

  const formData = new FormData();
  formData.append("image_file", inputFile);
  formData.append("size", "auto");

  const res = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: {
      "X-Api-Key": REMOVE_BG_API_KEY
    },
    body: formData
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`remove.bg hatası: ${errorText}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const blob = await put(`exports/bg-removed-${Date.now()}.png`, buffer, {
    access: "public",
    addRandomSuffix: true,
    contentType: "image/png"
  });

  return blob.url;
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") || "";
    let inputFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file");

      if (!(file instanceof File)) {
        return NextResponse.json(
          { success: false, error: "Dosya bulunamadı." },
          { status: 400 }
        );
      }

      inputFile = file;
    } else {
      const body = await req.json();
      const imageUrl = body?.imageUrl as string | undefined;

      if (!imageUrl) {
        return NextResponse.json(
          { success: false, error: "imageUrl veya file gerekli." },
          { status: 400 }
        );
      }

      const imageRes = await fetch(imageUrl);

      if (!imageRes.ok) {
        throw new Error("Görsel indirilemedi.");
      }

      const imageArrayBuffer = await imageRes.arrayBuffer();

      inputFile = new File([imageArrayBuffer], "input.png", {
        type: "image/png"
      });
    }

    const url = await removeBackgroundWithRemoveBg(inputFile);

    return NextResponse.json({
      success: true,
      url
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Arka plan kaldırılırken hata oluştu."
      },
      { status: 500 }
    );
  }
}
