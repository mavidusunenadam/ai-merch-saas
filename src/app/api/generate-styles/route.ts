import { PrismaClient } from "@prisma/client";
import OpenAI from "openai";

const prisma = new PrismaClient();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const shopDomain = url.searchParams.get("shop");

    if (!shopDomain) {
      return Response.json({ error: "Shop missing" }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { shopDomain },
      include: {
        promptSelections: {
          include: {
            promptPreset: true,
          },
        },
      },
    });

    if (!shop) {
      return Response.json({ error: "Shop not found" }, { status: 404 });
    }

    if (shop.creditsRemaining <= 0) {
      return Response.json(
        { error: "No credits remaining" },
        { status: 403 }
      );
    }

    const prompts = shop.promptSelections
      .map((s) => s.promptPreset)
      .filter((p) => p?.isActive)
      .slice(0, 4);

    if (!prompts.length) {
      return Response.json(
        { error: "No prompts configured" },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        { error: "Image file missing" },
        { status: 400 }
      );
    }

    const results = [];

    for (const preset of prompts) {
      const response = await openai.images.edit({
        model: "gpt-image-1",
        image: file, // 🔥 BUFFER YERİNE FILE
        prompt: preset.promptText,
        size: "1024x1024",
      });

      const img = response.data?.[0];

      if (!img?.b64_json) {
        throw new Error("Image generation failed");
      }

      results.push({
        key: preset.key,
        title: preset.title,
        url: `data:image/png;base64,${img.b64_json}`,
      });
    }

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        creditsRemaining: {
          decrement: 1,
        },
      },
    });

    await prisma.creditLog.create({
      data: {
        shopId: shop.id,
        amount: -1,
        type: "IMAGE_GENERATION",
        reason: "AI style generation",
      },
    });

    return Response.json({
      success: true,
      results,
      creditsRemaining: updatedShop.creditsRemaining,
    });
  } catch (error) {
    console.error("GENERATE STYLES ERROR:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Generation failed",
      },
      { status: 500 }
    );
  }
}